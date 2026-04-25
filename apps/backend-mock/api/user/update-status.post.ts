import { defineEventHandler, readBody, setResponseStatus } from 'h3';

import {
  MOCK_USERS,
  ROLE_SYSTEM_ADMIN,
  ROLE_GROUP_ADMIN,
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

  const body = await readBody(event);
  const { userId, status } = body as {
    userId: number;
    status: 'active' | 'disabled';
  };

  if (!userId || !status) {
    setResponseStatus(event, 400);
    return useResponseError('Bad Request', 'userId and status are required');
  }

  const targetUser = MOCK_USERS.find((u) => u.id === userId);
  if (!targetUser) {
    setResponseStatus(event, 404);
    return useResponseError('Not Found', 'User not found');
  }

  // Group admin can only manage users in own group
  if (!isSysAdmin && targetUser.groupId !== userinfo.groupId) {
    return forbiddenResponse(event, 'Permission denied');
  }

  // Group admin cannot disable/enable another group admin
  if (!isSysAdmin && targetUser.roles.includes(ROLE_GROUP_ADMIN)) {
    return forbiddenResponse(event, 'Cannot modify another group admin');
  }

  // Cannot disable system admin accounts
  if (targetUser.roles.includes(ROLE_SYSTEM_ADMIN)) {
    return forbiddenResponse(event, 'Cannot modify system admin');
  }

  targetUser.status = status;
  return useResponseSuccess({ success: true });
});
