import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDto } from '../models/dtos/UserDto';

export interface SecurityEventDto {
  id: number;
  eventType: string;
  status: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  location: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.mainApiUrl;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${this.apiUrl}/auth/users`);
  }

  getSecurityActivity(): Observable<SecurityEventDto[]> {
    return this.http.get<SecurityEventDto[]>(
      `${this.apiUrl}/auth/security-activity`,
    );
  }

  logSecurityEvent(eventType: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/security-activity/log`, {
      eventType,
    });
  }
}
