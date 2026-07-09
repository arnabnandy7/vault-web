export interface GroupMemberUserDto {
  id: number;
  username: string;
}

export interface GroupMemberDto {
  id: number;
  user: GroupMemberUserDto;
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
