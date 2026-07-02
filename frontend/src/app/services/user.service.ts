import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDto } from '../models/dtos/UserDto';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.mainApiUrl;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${this.apiUrl}/auth/users`);
  }

  // ── Profile Picture API Methods ─────────────────────────────────────────────

  /**
   * Uploads a new profile picture for the currently logged-in user.
   *
   * We use FormData instead of JSON because files must be sent as multipart/form-data.
   * Think of FormData like an HTML <form> — it packages the file as a form field named "file".
   * The backend reads it with @RequestParam("file") MultipartFile file.
   *
   * @param file  The File object from the browser's file input (<input type="file">)
   * @returns     Observable that emits { profilePicture: "uploads/..." } on success
   */
  uploadProfilePicture(file: File): Observable<{ profilePicture: string }> {
    // FormData is the browser's built-in way to send multipart form data
    const formData = new FormData();
    // "file" must match the @RequestParam("file") name in the backend controller
    formData.append('file', file);
    return this.http.post<{ profilePicture: string }>(
      `${this.apiUrl}/auth/profile-picture`,
      formData
      // Note: Do NOT set Content-Type header manually here!
      // When you pass FormData, Angular automatically sets it to "multipart/form-data"
      // with the correct boundary. Setting it manually would break the upload.
    );
  }

  /**
   * Fetches the current user's profile picture path from the backend.
   *
   * @returns Observable emitting { profilePicture: string } — empty string means no picture
   */
  getProfilePicture(): Observable<{ profilePicture: string }> {
    return this.http.get<{ profilePicture: string }>(
      `${this.apiUrl}/auth/profile-picture`
    );
  }

  /**
   * Deletes the current user's profile picture.
   *
   * @returns Observable<void> — just subscribe to know when it's done
   */
  deleteProfilePicture(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/auth/profile-picture`);
  }

  /**
   * Converts a relative picture path (e.g. "uploads/profile-pictures/42_abc.jpg")
   * into a full URL that the browser can use in an <img src="..."> tag.
   *
   * The backend runs at http://localhost:8080, so the full URL becomes:
   * http://localhost:8080/uploads/profile-pictures/42_abc.jpg
   *
   * @param relativePath  The path stored in the database, or null/empty string
   * @returns The full URL string, or null if no picture is set
   */
  getProfilePictureUrl(relativePath: string | null | undefined): string | null {
    if (!relativePath) {
      return null; // No picture set — caller should show a fallback avatar
    }
    // environment.mainApiUrl = "http://localhost:8080/api"
    // We need just the base URL (without "/api"), so we strip the /api suffix
    const baseUrl = this.apiUrl.replace('/api', '');
    return `${baseUrl}/${relativePath}`;
  }
}
