import type { RouteRecordRaw } from 'vue-router';

import {
  VBEN_ANTDV_NEXT_PREVIEW_URL,
  VBEN_DOC_URL,
  VBEN_ELE_PREVIEW_URL,
  VBEN_GITHUB_URL,
  VBEN_LOGO_URL,
  VBEN_NAIVE_PREVIEW_URL,
  VBEN_TD_PREVIEW_URL,
} from '@vben/constants';
import { SvgAntdvNextLogoIcon, SvgTDesignIcon } from '@vben/icons';

import { IFrameView } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:users',
      order: -1,
      title: $t('page.user-management.title'),
    },
    name: 'UserManagement',
    path: '/user-management',
    component: () => import('#/views/workspace/index.vue'),
  },
  {
    meta: {
      icon: 'lucide:settings',
      order: -1,
      title: $t('page.system-settings.title'),
    },
    name: 'SystemSettings',
    path: '/system-settings',
    component: () => import('#/views/workspace/index.vue'),
  },
  {
    meta: {
      icon: 'lucide:book',
      order: -1,
      title: $t('page.logs.title'),
    },
    name: 'Logs',
    path: '/logs',
    component: () => import('#/views/workspace/index.vue'),
  },
  {
    name: 'GenerateCode',
    path: '/generate-code',
    component: () => import('#/views/workspace/index.vue'),
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
