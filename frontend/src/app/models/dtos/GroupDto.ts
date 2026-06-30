import { UserDto } from './UserDto';

export interface GroupMemberDto {
  id: number;
  user: UserDto;
  role: 'ADMIN' | 'USER';
}

export interface GroupDto {
  id: number;
  name: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  members?: GroupMemberDto[];
}
