package vaultWeb.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vaultWeb.exceptions.InvalidFileException;

/**
 * Service responsible for all file-system operations related to profile pictures.
 *
 * <p>This class handles three main tasks:
 *  1. Validating the uploaded file (type and size checks)
 *  2. Storing the file on disk with a unique name
 *  3. Deleting a file from disk when a user removes or replaces their picture
 *
 * <p>Why a separate service? Keeping file-system logic here (not in the controller) makes the
 * code cleaner and easier to test. The controller just calls this service and doesn't need to
 * know HOW the file gets stored.
 */
@Service
public class ProfilePictureService {

  // Spring reads these values from application.properties and injects them here automatically.
  // @Value("${property.name}") is how you pull config values into a Spring bean.
  @Value("${app.upload.profile-picture.dir}")
  private String uploadDir;

  @Value("${app.upload.profile-picture.max-size-mb}")
  private int maxSizeMb;

  // The MIME types we accept. MIME types are standardized strings that identify file formats.
  // "image/jpeg" covers both .jpg and .jpeg files.
  private static final Set<String> ALLOWED_TYPES =
      Set.of("image/jpeg", "image/png", "image/webp");

  /**
   * Validates and stores an uploaded profile picture on disk.
   *
   * <p>Steps:
   * 1. Validate the file type and size (throws InvalidFileException if invalid)
   * 2. Create the upload directory on disk if it doesn't already exist
   * 3. Generate a unique filename to avoid collisions (userId + UUID + extension)
   * 4. Copy the file bytes to disk
   * 5. Return the relative path so the caller can store it in the database
   *
   * @param file   The uploaded file from the HTTP request (Spring wraps it as MultipartFile)
   * @param userId The ID of the user uploading — used as part of the filename
   * @return A relative path string like "uploads/profile-pictures/42_abc123.jpg"
   * @throws InvalidFileException if the file type or size is not allowed
   * @throws IOException          if there is a problem writing to disk
   */
  public String store(MultipartFile file, Long userId) throws IOException {
    // ── Step 1: Validate ──────────────────────────────────────────────────
    validateFile(file);

    // ── Step 2: Create the upload directory if it doesn't exist ──────────
    // Paths.get() converts a string like "uploads/profile-pictures" into a Path object
    // that Java can work with regardless of the OS (Windows uses \, Linux uses /).
    Path uploadPath = Paths.get(uploadDir);
    if (!Files.exists(uploadPath)) {
      // createDirectories() creates the folder AND any missing parent folders.
      Files.createDirectories(uploadPath);
    }

    // ── Step 3: Build a unique filename ───────────────────────────────────
    // Example of what this produces: "42_f3a1b2c4-d5e6-7890-abcd-ef1234567890.jpg"
    // The userId prefix makes it easy to find a user's files; the UUID ensures uniqueness.
    String originalFilename = file.getOriginalFilename();
    String extension = getExtension(originalFilename); // e.g., ".jpg"
    String uniqueFilename = userId + "_" + UUID.randomUUID() + extension;

    // ── Step 4: Write the file to disk ─────────────────────────────────────
    Path targetPath = uploadPath.resolve(uniqueFilename);
    // REPLACE_EXISTING: if a file with this name somehow already exists, overwrite it.
    // file.getInputStream() gives us the raw bytes of the uploaded file.
    Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

    // ── Step 5: Return the relative path (what we store in the DB) ─────────
    // We use forward slashes so the path works the same on Windows and Linux.
    return uploadDir + "/" + uniqueFilename;
  }

  /**
   * Deletes a profile picture file from disk.
   *
   * <p>Called when a user uploads a new picture (to remove the old one) or explicitly
   * deletes their picture. If the file doesn't exist, we silently do nothing — no error.
   *
   * @param relativePath The path string stored in the database, e.g. "uploads/profile-pictures/42_abc.jpg"
   */
  public void delete(String relativePath) {
    if (relativePath == null || relativePath.isBlank()) {
      return; // Nothing to delete
    }

    Path filePath = Paths.get(relativePath);
    try {
      // Files.deleteIfExists() — deletes the file if it's there, does nothing if it's not.
      // This is safer than Files.delete() which would throw an exception if file is missing.
      Files.deleteIfExists(filePath);
    } catch (IOException e) {
      // We log the error but don't crash the app — a missing file is not a critical failure.
      // In production you'd use a proper logger, but System.err is fine for learning.
      System.err.println("Warning: Could not delete profile picture file: " + relativePath + " — " + e.getMessage());
    }
  }

  // ── Private helper methods ──────────────────────────────────────────────────

  /**
   * Validates that the uploaded file is an accepted type and within the size limit.
   *
   * @param file The uploaded file to validate
   * @throws InvalidFileException if type or size check fails
   */
  private void validateFile(MultipartFile file) {
    // Check 1: Is the file empty?
    if (file == null || file.isEmpty()) {
      throw new InvalidFileException("Please select a file to upload.");
    }

    // Check 2: Is the content type (MIME type) one we accept?
    // getContentType() returns strings like "image/jpeg", "image/png", etc.
    String contentType = file.getContentType();
    if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
      throw new InvalidFileException(
          "Invalid file type. Only JPEG, PNG, and WebP images are allowed.");
    }

    // Check 3: Is the file within the size limit?
    // getSize() returns bytes. We convert maxSizeMb to bytes for comparison.
    long maxSizeBytes = (long) maxSizeMb * 1024 * 1024; // e.g., 2 * 1024 * 1024 = 2,097,152 bytes
    if (file.getSize() > maxSizeBytes) {
      throw new InvalidFileException(
          "File is too large. Maximum allowed size is " + maxSizeMb + " MB.");
    }
  }

  /**
   * Extracts the file extension from a filename.
   * Returns ".jpg" for "photo.jpg", ".png" for "avatar.png", etc.
   * Returns "" if there is no extension.
   */
  private String getExtension(String filename) {
    if (filename == null || !filename.contains(".")) {
      return "";
    }
    // lastIndexOf(".") finds the position of the LAST dot in the filename.
    // substring(pos) extracts everything from that position to the end.
    return filename.substring(filename.lastIndexOf(".")).toLowerCase();
  }
}
