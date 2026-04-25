import { defineEventHandler, readBody, setResponseStatus } from 'h3';

import {
  MOCK_USERS,
  ROLE_SYSTEM_ADMIN,
  ROLE_GROUP_ADMIN,
  ROLE_GROUP_USER,
} from '~/utils/mock-data';
import { verifyAccessToken } from '~/utils/jwt-utils';
import {
  forbiddenResponse,
  unAuthorizedResponse,
  useResponseError,
  useResponseSuccess,
} from '~/utils/response';

export default defineEventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const isSysAdmin = userinfo.roles.includes(ROLE_SYSTEM_ADMIN);
  const isGroupAdmin = userinfo.roles.includes(ROLE_GROUP_ADMIN);

  if (!isSysAdmin && !isGroupAdmin) {
    return forbiddenResponse(event, 'Permission denied');
  }

  const body = await readBody<{
    username: string;
    password: string;
    realName: string;
    email: string;
    validUntil: string;
    role: string;
    groupId?: string;
  }>(event);

  const { username, password, realName, email, validUntil, role, groupId } =
    body;

  if (!username || !password || !realName || !email || !validUntil || !role) {
    setResponseStatus(event, 400);
    return useResponseError(
      'Bad Request',
      'All required fields must be provided',
    );
  }

  // Determine target group
  const targetGroupId = isSysAdmin ? groupId : userinfo.groupId;
  if (!targetGroupId) {
    setResponseStatus(event, 400);
    return useResponseError('Bad Request', 'groupId is required');
  }

  // Group admin can only create group-user role in their own group
  if (!isSysAdmin && role !== ROLE_GROUP_USER) {
    return forbiddenResponse(event, 'Group admin can only create group-user');
  }

  if (MOCK_USERS.some((u) => u.username === username.trim())) {
    setResponseStatus(event, 400);
    return useResponseError('Bad Request', 'Username already exists');
  }

  const newId = Math.max(...MOCK_USERS.map((u) => u.id)) + 1;
  const newUser = {
    id: newId,
    username: username.trim(),
    password,
    realName: realName.trim(),
    roles: [role],
    groupId: targetGroupId,
    status: 'active' as const,
    email: email.trim(),
    validUntil,
    homePath: '/profile',
  };

  MOCK_USERS.push(newUser);

  const { password: _pw, ...safeUser } = newUser;
  return useResponseSuccess({ success: true, user: safeUser });
});
