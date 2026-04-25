import { requestClient } from '#/api/request';

export interface GroupInfo {
  id: string;
  name: string;
  description?: string;
}

export interface UserListItem {
  id: number;
  realName: string;
  username: string;
  roles: string[];
  groupId: string;
  status: 'active' | 'disabled';
  email: string;
  validUntil: string;
}

export interface CreateGroupParams {
  name: string;
  description?: string;
}

export interface CreateUserParams {
  username: string;
  password: string;
  realName: string;
  email: string;
  validUntil: string;
  role: string;
  groupId?: string;
}

export async function getUserGroupsApi() {
  return requestClient.get<GroupInfo[]>('/user/groups');
}

export async function getUserListApi(groupId?: string) {
  return requestClient.get<UserListItem[]>('/user/list', {
    params: groupId ? { groupId } : {},
  });
}

export async function createGroupApi(params: CreateGroupParams) {
  return requestClient.post<{ success: boolean }>('/user/create-group', params);
}

export async function createUserApi(params: CreateUserParams) {
  return requestClient.post<{ success: boolean }>('/user/create-user', params);
}

export async function updateUserRoleApi(userId: number, role: string) {
  return requestClient.post<{ success: boolean }>('/user/update-role', {
    userId,
    role,
  });
}

export async function deleteUserApi(userId: number) {
  return requestClient.post<{ success: boolean }>('/user/delete', { userId });
}

export async function updateUserStatusApi(
  userId: number,
  status: 'active' | 'disabled',
) {
  return requestClient.post<{ success: boolean }>('/user/update-status', {
    userId,
    status,
  });
}
