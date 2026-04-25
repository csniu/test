import { defineEventHandler, getQuery } from 'h3';

import {
  MOCK_USERS,
  ROLE_SYSTEM_ADMIN,
  ROLE_GROUP_ADMIN,
} from '~/utils/mock-data';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

export default defineEventHandler((event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const query = getQuery(event);

  let users = MOCK_USERS.filter(
    (u) => !u.roles.includes(ROLE_SYSTEM_ADMIN),
  ).map(({ password: _password, ...rest }) => rest);

  if (userinfo.roles.includes(ROLE_SYSTEM_ADMIN)) {
    // Super admin sees all users; optionally filter by groupId
    if (query.groupId) {
      users = users.filter((u) => u.groupId === query.groupId);
    }
  } else if (userinfo.roles.includes(ROLE_GROUP_ADMIN)) {
    // Group admin sees only own group
    users = users.filter((u) => u.groupId === userinfo.groupId);
  } else {
    // Regular user cannot call this endpoint meaningfully
    users = users.filter((u) => u.username === userinfo.username);
  }

  return useResponseSuccess(users);
});
