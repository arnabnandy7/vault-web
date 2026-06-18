package vaultWeb.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configures Spring MVC to serve static files from the local filesystem.
 *
 * <p>WHY do we need this? When a user uploads a profile picture, the file is saved to a folder
 * on disk (e.g., "uploads/profile-pictures/"). For the Angular frontend to display this image
 * in an <img> tag, the browser needs to be able to download the file over HTTP.
 *
 * <p>This class bridges that gap: it tells Spring "if a request comes in for /uploads/**,
 * look inside the uploads/ folder on disk and return the matching file."
 *
 * <p>HOW it works:
 * - addResourceHandler("/uploads/**") = match any URL that starts with /uploads/
 * - addResourceLocations("file:uploads/") = look for files in the uploads/ directory
 *   relative to where the application is running.
 *   The "file:" prefix is important — it tells Spring to look on the real filesystem,
 *   NOT inside the JAR file (which would be "classpath:").
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

  // Read the upload directory from application.properties
  // We re-use the same property so that if someone changes the directory, both the
  // ProfilePictureService (which writes files) and this config (which serves them) stay in sync.
  @Value("${app.upload.profile-picture.dir}")
  private String uploadDir;

  /**
   * Registers a URL path pattern to serve files from the local uploads directory.
   *
   * <p>Example: a GET request to http://localhost:8080/uploads/profile-pictures/42_abc.jpg
   * will return the file at uploads/profile-pictures/42_abc.jpg on disk.
   *
   * @param registry The ResourceHandlerRegistry where we register our handler
   */
  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    // Derive the parent folder from the upload dir.
    // uploadDir = "uploads/profile-pictures", so parentDir = "uploads"
    // We expose the whole "uploads/" folder so future sub-directories also work.
    String parentDir = uploadDir.contains("/")
        ? uploadDir.substring(0, uploadDir.indexOf("/"))
        : uploadDir;

    registry
        // Match any URL that starts with /uploads/
        .addResourceHandler("/uploads/**")
        // Serve from the "uploads/" folder on disk. Note: must end with a slash.
        // "file:" prefix = local filesystem. Without it, Spring looks in the JAR classpath.
        .addResourceLocations("file:" + parentDir + "/");
  }
}
