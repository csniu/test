import { defineOverridesPreferences } from '@vben/preferences';

/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 * !!! 更改配置后请清空缓存，否则可能不生效
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    /** 应用名 */
    name: import.meta.env.VITE_APP_TITLE,
    enableCheckUpdates: false,
    layout: 'header-nav',
    locale: 'en-US',
    /** 是否显示偏好设置 */
    enablePreferences: true,
    authPageLayout: 'panel-center',
  },
  tabbar: {
    enable: false,
  },
  theme: {
    mode: 'auto',
  },
  widget: {
    globalSearch: false,
    notification: false,
    refresh: false,
    sidebarToggle: false,
    timezone: false,
  },
});
