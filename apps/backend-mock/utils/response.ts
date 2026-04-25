import type { EventHandlerRequest, H3Event } from 'h3';

import { setResponseStatus } from 'h3';

export function useResponseSuccess<T = any>(data: T) {
  return data;
}

export function usePageResponseSuccess<T = any>(
  page: number | string,
  pageSize: number | string,
  list: T[],
) {
  const currentPage = Number.parseInt(`${page}`);
  const currentPageSize = Number.parseInt(`${pageSize}`);
  const pageData = pagination(currentPage, currentPageSize, list);

  return useResponseSuccess({
    items: pageData,
    page: currentPage,
    pageSize: currentPageSize,
    total: list.length,
  });
}

export function useResponseError(message: string, error: any = null) {
  return {
    error: {
      details: error,
      message,
    },
  };
}

export function forbiddenResponse(
  event: H3Event<EventHandlerRequest>,
  message = 'Forbidden',
) {
  setResponseStatus(event, 403);
  return useResponseError(message, message);
}

export function unAuthorizedResponse(event: H3Event<EventHandlerRequest>) {
  setResponseStatus(event, 401);
  return useResponseError('Unauthorized', 'Unauthorized');
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function pagination<T = any>(
  pageNo: number,
  pageSize: number,
  array: T[],
): T[] {
  const offset = (pageNo - 1) * Number(pageSize);
  return offset + Number(pageSize) >= array.length
    ? array.slice(offset)
    : array.slice(offset, offset + Number(pageSize));
}
