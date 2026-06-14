import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, map, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.mainApiUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(username: string, password: string): Observable<{ token: string }> {
    return this.http
      .post<{
        token: string;
      }>(
        `${this.apiUrl}/auth/login`,
        { username, password },
        { withCredentials: true },
      )
      .pipe(
        tap((res) => {
          this.saveToken(res.token);
          this.saveUsername(username);
        }),
      );
  }

  register(username: string, password: string): Observable<string> {
    return this.http.post(
      `${this.apiUrl}/auth/register`,
      { username, password },
      { responseType: 'text' },
    );
  }

  refresh(): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(
      `${this.apiUrl}/auth/refresh`,
      {},
      { withCredentials: true },
    );
  }

  changePassword(
    currentPassword: string,
    newPassword: string,
  ): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/change-password`, {
      currentPassword,
      newPassword,
    });
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  saveUsername(username: string): void {
    localStorage.setItem('username', username);
  }

  getToken(): string | null {
    return localStorage.getItem('token') as string | null;
  }

  getUsername(): string | null {
    return localStorage.getItem('username') as string | null;
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token && !this.isTokenExpired(token);
  }

  // A present-but-expired token must not count as logged in, otherwise authGuard
  // would let a stale session navigate to protected pages. If the token can't be
  // decoded we fall back to "not expired" and let the 401 + refresh flow handle
  // it, to avoid logging the user out on a parsing quirk.
  private isTokenExpired(token: string): boolean {
    const expiryMs = this.getTokenExpiryMs(token);
    return expiryMs !== null && Date.now() >= expiryMs;
  }

  private getTokenExpiryMs(token: string): number | null {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    try {
      const payload = JSON.parse(this.decodeBase64Url(parts[1])) as {
        exp?: number;
      };
      return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  private decodeBase64Url(value: string): string {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const padding = (4 - (base64.length % 4)) % 4;
    return atob(base64 + '='.repeat(padding));
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.http
      .post(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true })
      .pipe(
        finalize(() => {
          this.router.navigate(['/login']);
        }),
      )
      .subscribe({
        error: (err) => {
          console.error('Backend logout failed', err);
        },
      });
  }

  checkUsernameExists(username: string): Observable<boolean> {
    return this.http
      .get<{
        exists: boolean;
      }>(`${this.apiUrl}/auth/check-username`, { params: { username } })
      .pipe(map((response) => response.exists));
  }
}
