import { requestClient } from '#/api/request';

export interface AuditLogItem {
  id: string;
  category: string;
  color: string;
  productName: string;
  price: string;
  releaseDate: string;
}

export interface AuditLogListParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: string;
  category?: string;
  productName?: string;
  price?: string;
  color?: string;
  start?: string;
  end?: string;
}

export async function getAuditLogListApi(params: AuditLogListParams) {
  return requestClient.get<{ items: AuditLogItem[]; total: number }>(
    '/audit-log/list',
    { params },
  );
}
