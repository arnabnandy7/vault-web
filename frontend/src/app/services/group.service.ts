import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { GroupDto } from '../models/dtos/GroupDto';
import { ChatMessageDto } from '../models/dtos/ChatMessageDto';
import { DeviceDto } from '../models/dtos/DeviceDto';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private apiUrl = `${environment.mainApiUrl}/groups`;

  constructor(private http: HttpClient) {}

  getUserGroups(): Observable<GroupDto[]> {
    return this.http.get<GroupDto[]>(`${this.apiUrl}/my-groups`);
  }

  getGroupMessages(groupId: number): Observable<ChatMessageDto[]> {
    return this.http.get<ChatMessageDto[]>(
      `${this.apiUrl}/${groupId}/messages`,
    );
  }

  getGroupDevices(groupId: number): Observable<DeviceDto[]> {
    return this.http.get<DeviceDto[]>(`${this.apiUrl}/${groupId}/devices`);
  }

  getGroupDetails(groupId: number): Observable<GroupDto> {
    return this.http.get<GroupDto>(`${this.apiUrl}/${groupId}`);
  }

  addMember(groupId: number, userId: number): Observable<GroupDto> {
    return this.http.post<GroupDto>(
      `${this.apiUrl}/${groupId}/members/${userId}`,
      {},
    );
  }

  removeMember(groupId: number, userId: number): Observable<GroupDto> {
    return this.http.delete<GroupDto>(
      `${this.apiUrl}/${groupId}/members/${userId}`,
    );
  }

  leaveGroup(groupId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${groupId}/leave`);
  }
}
