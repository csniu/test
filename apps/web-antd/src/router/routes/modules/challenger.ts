import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:users',
      order: -1,
      title: $t('page.user-management.title'),
      role: ['sysadmin', 'groupadmin'],
    },
    name: 'UserManagement',
    path: '/user-management',
    component: () => import('#/views/user_management/index.vue'),
  },
  {
    meta: {
      icon: 'lucide:settings',
      order: -1,
      title: $t('page.system-settings.title'),
      role: ['sysadmin'],
    },
    name: 'SystemSettings',
    path: '/system-settings',
    component: () => import('#/views/system_settings/index.vue'),
  },
  {
    meta: {
      icon: 'lucide:book',
      order: -1,
      title: $t('page.logs.title'),
      role: ['sysadmin'],
    },
    name: 'Logs',
    path: '/logs',
    component: () => import('#/views/audit_log/index.vue'),
  },
  {
    name: 'ChallengeCode',
    path: '/challenge-code',
    component: () => import('#/views/challenge_code/index.vue'),
    meta: {
      icon: 'lucide:shield-check',
      title: $t('page.generate-code.title'),
      order: 9999,
    },
  },
  {
    name: 'Profile',
    path: '/profile',
    component: () => import('#/views/_core/profile/index.vue'),
    meta: {
      icon: 'lucide:user',
      hideInMenu: true,
      title: $t('page.auth.profile'),
    },
  },
];

export default routes;
