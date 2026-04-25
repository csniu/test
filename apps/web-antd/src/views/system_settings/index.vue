<script lang="ts" setup>
import { onMounted } from 'vue';

import { Page } from '@vben/common-ui';

import { Card, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  getSystemSettingsApi,
  saveSystemSettingsApi,
} from '#/api/core/system-settings';
import { $t } from '#/locales';

const [BaseForm, baseFormApi] = useVbenForm({
  commonConfig: {
    colon: true,
    componentProps: {
      class: 'w-2/4',
    },
  },
  handleSubmit: onSubmit,
  layout: 'vertical',
  schema: [
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: '',
      },
      fieldName: 'passwordExpiration',
      label: $t('page.system-settings.passwordExpiration'),
      formItemClass: 'col-start-1',
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: '',
      },
      fieldName: 'maxLoginAttempts',
      label: $t('page.system-settings.maxLoginAttempts'),
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: '',
      },
      fieldName: 'userValidityPeriod',
      label: $t('page.system-settings.userValidityPeriod'),
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: '',
      },
      fieldName: 'autoDisableInactiveUsers',
      label: $t('page.system-settings.autoDisableInactiveUsers'),
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2',
});

async function onSubmit(values: Record<string, any>) {
  try {
    await saveSystemSettingsApi(values as any);
    message.success($t('ui.actionMessage.operationSuccess'));
  } catch {
    message.error($t('ui.actionMessage.operationFailed'));
  }
}

onMounted(async () => {
  try {
    const settings = await getSystemSettingsApi();
    baseFormApi.setValues(settings);
  } catch {
    message.error($t('ui.actionMessage.operationFailed'));
  }
});
</script>

<template>
  <Page content-class="flex flex-col" auto-content-height>
    <Card class="flex-1" :title="$t('page.system-settings.security')">
      <BaseForm />
    </Card>
  </Page>
</template>
