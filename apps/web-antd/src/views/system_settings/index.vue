<script lang="ts" setup>
import { onMounted } from 'vue';

import { Page } from '@vben/common-ui';

import { Card, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { $t } from '#/locales';

const [BaseForm, baseFormApi] = useVbenForm({
  commonConfig: {
    colon: true,
    componentProps: {
      class: 'w-2/4',
    },
  },
  fieldMappingTime: [['rangePicker', ['startTime', 'endTime'], 'YYYY-MM-DD']],
  handleSubmit: onSubmit,
  handleValuesChange(_values, fieldsChanged) {
    message.info(`表单以下字段发生变化：${fieldsChanged.join('，')}`);
  },

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

function onSubmit(values: Record<string, any>) {
  message.success({
    content: `form values: ${JSON.stringify(values)}`,
  });
}

function handleSetFormValue() {
  baseFormApi.setValues({
    passwordExpiration: 90,
    maxLoginAttempts: 5,
    userValidityPeriod: 365,
    autoDisableInactiveUsers: 30,
  });
}

onMounted(() => {
  handleSetFormValue();
});
</script>

<template>
  <Page content-class="flex flex-col gap-4">
    <Card :title="$t('page.system-settings.security')">
      <BaseForm />
    </Card>
  </Page>
</template>
