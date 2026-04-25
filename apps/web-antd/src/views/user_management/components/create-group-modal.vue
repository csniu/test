<script lang="ts" setup>
import type { CreateGroupParams } from '#/api/core/user-management';

import { computed, ref, watch } from 'vue';

import { Form, FormItem, Input, Modal, message } from 'ant-design-vue';

import { createGroupApi } from '#/api/core/user-management';
import { $t } from '#/locales';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  success: [];
  'update:open': [value: boolean];
}>();

const modalOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
});

const loading = ref(false);
const form = ref<CreateGroupParams>({
  name: '',
  description: '',
});

function resetForm() {
  form.value = {
    name: '',
    description: '',
  };
}

function handleCancel() {
  modalOpen.value = false;
  resetForm();
}

async function handleCreateGroup() {
  if (!form.value.name.trim()) {
    message.warning($t('page.user-management.groupNameRequired'));
    return;
  }

  loading.value = true;
  try {
    await createGroupApi(form.value);
    message.success($t('page.user-management.createGroupSuccess'));
    emit('success');
    modalOpen.value = false;
    resetForm();
  } catch {
    message.error($t('page.user-management.createGroupFail'));
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.open,
  (opened) => {
    if (opened) {
      resetForm();
    }
  },
);
</script>

<template>
  <Modal
    v-model:open="modalOpen"
    :title="$t('page.user-management.addGroup')"
    :confirm-loading="loading"
    @ok="handleCreateGroup"
    @cancel="handleCancel"
  >
    <Form layout="vertical" class="mt-4">
      <FormItem :label="$t('page.user-management.groupName')" required>
        <Input
          v-model:value="form.name"
          :placeholder="$t('page.user-management.groupNamePlaceholder')"
        />
      </FormItem>
      <FormItem :label="$t('page.user-management.groupDesc')">
        <Input
          v-model:value="form.description"
          :placeholder="$t('page.user-management.groupDescPlaceholder')"
        />
      </FormItem>
    </Form>
  </Modal>
</template>
