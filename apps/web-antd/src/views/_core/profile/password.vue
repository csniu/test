<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';

import { computed } from 'vue';

import { Page, ProfilePasswordSetting, z } from '@vben/common-ui';

import { Card, message } from 'ant-design-vue';

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      fieldName: 'oldPassword',
      label: '旧密码',
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: '请输入旧密码',
      },
    },
    {
      fieldName: 'newPassword',
      label: '新密码',
      component: 'VbenInputPassword',
      componentProps: {
        passwordStrength: true,
        placeholder: '请输入新密码',
      },
    },
    {
      fieldName: 'confirmPassword',
      label: '确认密码',
      component: 'VbenInputPassword',
      componentProps: {
        passwordStrength: true,
        placeholder: '请再次输入新密码',
      },
      dependencies: {
        rules(values) {
          const { newPassword } = values;
          return z
            .string({ required_error: '请再次输入新密码' })
            .min(1, { message: '请再次输入新密码' })
            .refine((value) => value === newPassword, {
              message: '两次输入的密码不一致',
            });
        },
        triggerFields: ['newPassword'],
      },
    },
  ];
});

function handleSubmit() {
  message.success('密码修改成功');
}
</script>
<template>
  <Page content-class="flex flex-col" auto-content-height>
    <Card class="flex-1">
      <div class="flex min-h-[520px] items-center justify-center px-4">
        <ProfilePasswordSetting
          class="w-full max-w-[520px]"
          :form-schema="formSchema"
          @submit="handleSubmit"
        />
      </div>
    </Card>
  </Page>
</template>
