import { defineEventHandler } from 'h3';

import { MOCK_GROUPS, ROLE_SYSTEM_ADMIN } from '~/utils/mock-data';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

export default defineEventHandler((event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  if (userinfo.roles.includes(ROLE_SYSTEM_ADMIN)) {
    return useResponseSuccess(MOCK_GROUPS);
  }

  // Group admin / regular user can only see their own group
  const groups = MOCK_GROUPS.filter((g) => g.id === userinfo.groupId);
  return useResponseSuccess(groups);
});
