<script lang="ts" setup>
import type { CreateUserParams, GroupInfo } from '#/api/core/user-management';

import { computed, ref, watch } from 'vue';

import {
  Col,
  DatePicker,
  Form,
  FormItem,
  Input,
  InputPassword,
  message,
  Modal,
  Row,
  Select,
  SelectOption,
} from 'ant-design-vue';

import { createUserApi } from '#/api/core/user-management';
import { $t } from '#/locales';

import { ROLE_GROUP_ADMIN, ROLE_GROUP_USER } from '../constants';

const props = defineProps<{
  groups: GroupInfo[];
  isSysAdmin: boolean;
  open: boolean;
  selectedGroupId: string;
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
const form = ref<CreateUserParams>({
  username: '',
  password: '',
  realName: '',
  email: '',
  validUntil: '',
  role: ROLE_GROUP_USER,
  groupId: '',
});

const availableRoles = computed(() => {
  if (props.isSysAdmin) {
    return [
      {
        label: $t('page.user-management.roleGroupAdmin'),
        value: ROLE_GROUP_ADMIN,
      },
      {
        label: $t('page.user-management.roleGroupUser'),
        value: ROLE_GROUP_USER,
      },
    ];
  }

  return [
    {
      label: $t('page.user-management.roleGroupUser'),
      value: ROLE_GROUP_USER,
    },
  ];
});

function resetForm() {
  form.value = {
    username: '',
    password: '',
    realName: '',
    email: '',
    validUntil: '',
    role: ROLE_GROUP_USER,
    groupId: props.isSysAdmin ? props.selectedGroupId || '' : '',
  };
}

function handleCancel() {
  modalOpen.value = false;
  resetForm();
}

async function handleCreateUser() {
  const currentForm = form.value;

  if (
    !currentForm.username ||
    !currentForm.password ||
    !currentForm.realName ||
    !currentForm.email ||
    !currentForm.validUntil ||
    !currentForm.role
  ) {
    message.warning($t('page.user-management.fillRequired'));
    return;
  }

  if (props.isSysAdmin && !currentForm.groupId) {
    message.warning($t('page.user-management.groupRequired'));
    return;
  }

  loading.value = true;
  try {
    await createUserApi({
      ...currentForm,
      groupId: props.isSysAdmin ? currentForm.groupId : undefined,
    });
    message.success($t('page.user-management.createUserSuccess'));
    emit('success');
    modalOpen.value = false;
    resetForm();
  } catch {
    message.error($t('page.user-management.createUserFail'));
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
    :title="$t('page.user-management.addUser')"
    :confirm-loading="loading"
    @ok="handleCreateUser"
    @cancel="handleCancel"
  >
    <Form layout="vertical" class="mt-4">
      <Row :gutter="16">
        <Col :span="12">
          <FormItem :label="$t('page.user-management.username')" required>
            <Input
              v-model:value="form.username"
              :placeholder="$t('page.user-management.usernamePlaceholder')"
            />
          </FormItem>
        </Col>
        <Col :span="12">
          <FormItem :label="$t('page.user-management.password')" required>
            <InputPassword
              v-model:value="form.password"
              :placeholder="$t('page.user-management.passwordPlaceholder')"
            />
          </FormItem>
        </Col>
      </Row>
      <Row :gutter="16">
        <Col :span="12">
          <FormItem :label="$t('page.user-management.realName')" required>
            <Input
              v-model:value="form.realName"
              :placeholder="$t('page.user-management.realNamePlaceholder')"
            />
          </FormItem>
        </Col>
        <Col :span="12">
          <FormItem :label="$t('page.user-management.email')" required>
            <Input
              v-model:value="form.email"
              :placeholder="$t('page.user-management.emailPlaceholder')"
            />
          </FormItem>
        </Col>
      </Row>
      <Row :gutter="16">
        <Col :span="12">
          <FormItem :label="$t('page.user-management.validUntil')" required>
            <DatePicker
              v-model:value="form.validUntil"
              value-format="YYYY-MM-DD"
              style="width: 100%"
              :placeholder="$t('page.user-management.validUntilPlaceholder')"
            />
          </FormItem>
        </Col>
        <Col :span="12">
          <FormItem :label="$t('page.user-management.role')" required>
            <Select
              v-model:value="form.role"
              style="width: 100%"
              :placeholder="$t('page.user-management.selectRole')"
            >
              <SelectOption
                v-for="role in availableRoles"
                :key="role.value"
                :value="role.value"
              >
                {{ role.label }}
              </SelectOption>
            </Select>
          </FormItem>
        </Col>
      </Row>
      <FormItem
        v-if="isSysAdmin"
        :label="$t('page.user-management.groupPanel')"
        required
      >
        <Select
          v-model:value="form.groupId"
          style="width: 100%"
          :placeholder="$t('page.user-management.selectGroup')"
        >
          <SelectOption
            v-for="group in groups"
            :key="group.id"
            :value="group.id"
          >
            {{ group.name }}
          </SelectOption>
        </Select>
      </FormItem>
    </Form>
  </Modal>
</template>
