import { requestClient } from '#/api/request';

export interface SystemSecuritySettings {
  passwordExpiration: number;
  maxLoginAttempts: number;
  userValidityPeriod: number;
  autoDisableInactiveUsers: number;
}

export async function getSystemSettingsApi() {
  return requestClient.get<SystemSecuritySettings>('/system/settings');
}

export async function saveSystemSettingsApi(params: SystemSecuritySettings) {
  return requestClient.post<{ success: boolean }>('/system/settings', params);
}
