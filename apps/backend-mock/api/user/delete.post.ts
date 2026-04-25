import { defineEventHandler, readBody } from 'h3';

import {
  MOCK_USERS,
  ROLE_SYSTEM_ADMIN,
  ROLE_GROUP_ADMIN,
} from '~/utils/mock-data';
import { verifyAccessToken } from '~/utils/jwt-utils';
import {
  forbiddenResponse,
  unAuthorizedResponse,
  useResponseSuccess,
  useResponseError,
} from '~/utils/response';

export default defineEventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const body = await readBody<{ userId: number }>(event);
  const { userId } = body;

  const targetIndex = MOCK_USERS.findIndex((u) => u.id === userId);
  if (targetIndex === -1) {
    return useResponseError('User not found', 'USER_NOT_FOUND');
  }

  const target = MOCK_USERS[targetIndex];

  if (target && target.roles.includes(ROLE_SYSTEM_ADMIN)) {
    return forbiddenResponse(event);
  }

  const isSysAdmin = userinfo.roles.includes(ROLE_SYSTEM_ADMIN);
  const isGroupAdmin = userinfo.roles.includes(ROLE_GROUP_ADMIN);

  if (!isSysAdmin && !isGroupAdmin) {
    return forbiddenResponse(event);
  }

  if (isGroupAdmin && !isSysAdmin) {
    if (!target || target.groupId !== userinfo.groupId) {
      return forbiddenResponse(event);
    }
    if (target.roles.includes(ROLE_GROUP_ADMIN)) {
      return forbiddenResponse(event);
    }
  }

  MOCK_USERS.splice(targetIndex, 1);
  return useResponseSuccess({ success: true });
});
