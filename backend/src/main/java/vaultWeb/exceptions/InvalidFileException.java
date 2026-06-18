package vaultWeb.exceptions;

/**
 * Thrown when an uploaded file fails validation.
 *
 * <p>This is a RuntimeException, which means you don't have to declare it in method signatures
 * with "throws InvalidFileException" — Spring will automatically catch it via the
 * GlobalExceptionHandler and return a 400 Bad Request response to the client.
 *
 * <p>Examples of when this is thrown:
 * - File type is not JPEG, PNG, or WebP
 * - File size exceeds the configured limit (default 2 MB)
 * - File is empty
 */
public class InvalidFileException extends RuntimeException {

  /**
   * Constructs a new InvalidFileException with a message describing what went wrong.
   *
   * @param message A human-readable description, e.g. "File is too large. Maximum is 2 MB."
   */
  public InvalidFileException(String message) {
    super(message);
  }
}
