import { defineEventHandler, readBody, setResponseStatus } from 'h3';

import { MOCK_GROUPS, ROLE_SYSTEM_ADMIN } from '~/utils/mock-data';
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

  if (!userinfo.roles.includes(ROLE_SYSTEM_ADMIN)) {
    return forbiddenResponse(event, 'Permission denied');
  }

  const body = await readBody<{ name: string; description?: string }>(event);
  const { name, description } = body;

  if (!name || !name.trim()) {
    setResponseStatus(event, 400);
    return useResponseError('Bad Request', 'Group name is required');
  }

  if (MOCK_GROUPS.some((g) => g.name === name.trim())) {
    setResponseStatus(event, 400);
    return useResponseError('Bad Request', 'Group name already exists');
  }

  const id = `group-${Date.now()}`;
  const newGroup = {
    id,
    name: name.trim(),
    description: description?.trim() || '',
  };
  MOCK_GROUPS.push(newGroup);

  return useResponseSuccess({ success: true, group: newGroup });
});
