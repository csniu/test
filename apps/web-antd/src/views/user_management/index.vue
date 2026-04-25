<script lang="ts" setup>
import type { GroupInfo, UserListItem } from '#/api/core/user-management';

import { computed, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Dropdown,
  Form,
  FormItem,
  Input,
  InputPassword,
  Menu,
  MenuItem,
  message,
  Modal,
  Row,
  Select,
  SelectOption,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import {
  createGroupApi,
  createUserApi,
  getUserGroupsApi,
  getUserListApi,
  updateUserRoleApi,
  updateUserStatusApi,
} from '#/api/core/user-management';
import { $t } from '#/locales';

const ROLE_SYSTEM_ADMIN = 'system-admin';
const ROLE_GROUP_ADMIN = 'group-admin';

const userStore = useUserStore();
const currentUserRoles = computed(() => userStore.userRoles);
const isSysAdmin = computed(() =>
  currentUserRoles.value.includes(ROLE_SYSTEM_ADMIN),
);
const isGroupAdmin = computed(() =>
  currentUserRoles.value.includes(ROLE_GROUP_ADMIN),
);

const loading = ref(false);
const groups = ref<GroupInfo[]>([]);
const selectedGroupId = ref<string>('');
const users = ref<UserListItem[]>([]);

const columns = computed(() => {
  const base = [
    {
      title: $t('page.user-management.username'),
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: $t('page.user-management.realName'),
      dataIndex: 'realName',
      key: 'realName',
    },
    {
      title: $t('page.user-management.role'),
      dataIndex: 'roles',
      key: 'roles',
    },
    {
      title: $t('page.user-management.status'),
      dataIndex: 'status',
      key: 'status',
    },
  ];
  if (isSysAdmin.value || isGroupAdmin.value) {
    base.push({
      title: $t('page.user-management.actions'),
      dataIndex: 'actions',
      key: 'actions',
    });
  }
  return base;
});

async function fetchGroups() {
  try {
    const data = await getUserGroupsApi();
    groups.value = data as unknown as GroupInfo[];
    if (groups.value.length > 0 && !selectedGroupId.value) {
      selectedGroupId.value = groups.value[0]!.id;
    }
  } catch {
    message.error($t('page.user-management.fetchGroupsFail'));
  }
}

async function fetchUsers() {
  loading.value = true;
  try {
    const params = isSysAdmin.value
      ? selectedGroupId.value || undefined
      : undefined;
    const data = await getUserListApi(params);
    users.value = data as unknown as UserListItem[];
  } catch {
    message.error($t('page.user-management.fetchUsersFail'));
  } finally {
    loading.value = false;
  }
}

async function handleGroupChange(groupId: string) {
  selectedGroupId.value = groupId;
  await fetchUsers();
}

async function handleSetRole(userId: number, role: string) {
  try {
    await updateUserRoleApi(userId, role);
    message.success($t('page.user-management.roleUpdateSuccess'));
    await fetchUsers();
  } catch {
    message.error($t('page.user-management.roleUpdateFail'));
  }
}

async function handleToggleStatus(user: UserListItem) {
  const newStatus = user.status === 'active' ? 'disabled' : 'active';
  const isDisabling = newStatus === 'disabled';
  Modal.confirm({
    title: isDisabling
      ? $t('page.user-management.confirmDisable')
      : $t('page.user-management.confirmEnable'),
    content: isDisabling
      ? $t('page.user-management.confirmDisableMsg', { name: user.realName })
      : $t('page.user-management.confirmEnableMsg', { name: user.realName }),
    okText: $t('page.user-management.confirm'),
    cancelText: $t('page.user-management.cancel'),
    onOk: async () => {
      try {
        await updateUserStatusApi(user.id, newStatus);
        message.success($t('page.user-management.statusUpdateSuccess'));
        await fetchUsers();
      } catch {
        message.error($t('page.user-management.statusUpdateFail'));
      }
    },
  });
}

function getRoleLabel(roles: string[]) {
  if (roles.includes(ROLE_SYSTEM_ADMIN))
    return $t('page.user-management.roleSysAdmin');
  if (roles.includes(ROLE_GROUP_ADMIN))
    return $t('page.user-management.roleGroupAdmin');
  return $t('page.user-management.roleGroupUser');
}

function getRoleColor(roles: string[]) {
  if (roles.includes(ROLE_SYSTEM_ADMIN)) return 'red';
  if (roles.includes(ROLE_GROUP_ADMIN)) return 'blue';
  return 'default';
}

function canSetRole(target: UserListItem) {
  if (isSysAdmin.value) return !target.roles.includes(ROLE_SYSTEM_ADMIN);
  if (isGroupAdmin.value) {
    return (
      !target.roles.includes(ROLE_GROUP_ADMIN) &&
      !target.roles.includes(ROLE_SYSTEM_ADMIN)
    );
  }
  return false;
}

function canToggleStatus(target: UserListItem) {
  if (target.roles.includes(ROLE_SYSTEM_ADMIN)) return false;
  if (isSysAdmin.value) return true;
  if (isGroupAdmin.value) {
    return !target.roles.includes(ROLE_GROUP_ADMIN);
  }
  return false;
}

const selectedGroup = computed(() =>
  groups.value.find((g) => g.id === selectedGroupId.value),
);

const groupStats = computed(() => {
  const adminCount = users.value.filter((u) =>
    u.roles.includes(ROLE_GROUP_ADMIN),
  ).length;
  const activeCount = users.value.filter((u) => u.status === 'active').length;
  const disabledCount = users.value.filter(
    (u) => u.status === 'disabled',
  ).length;
  return { adminCount, activeCount, disabledCount, total: users.value.length };
});

// Search
const searchKeyword = ref('');
const filteredUsers = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase();
  if (!kw) return users.value;
  return users.value.filter(
    (u) =>
      u.username.toLowerCase().includes(kw) ||
      u.realName.toLowerCase().includes(kw) ||
      u.email.toLowerCase().includes(kw),
  );
});

// Create Group Modal
const showCreateGroupModal = ref(false);
const createGroupForm = ref({ name: '', description: '' });
const createGroupLoading = ref(false);

async function handleCreateGroup() {
  if (!createGroupForm.value.name.trim()) {
    message.warning($t('page.user-management.groupNameRequired'));
    return;
  }
  createGroupLoading.value = true;
  try {
    await createGroupApi(createGroupForm.value);
    message.success($t('page.user-management.createGroupSuccess'));
    showCreateGroupModal.value = false;
    createGroupForm.value = { name: '', description: '' };
    await fetchGroups();
  } catch {
    message.error($t('page.user-management.createGroupFail'));
  } finally {
    createGroupLoading.value = false;
  }
}

// Create User Modal
const showCreateUserModal = ref(false);
const createUserForm = ref({
  username: '',
  password: '',
  realName: '',
  email: '',
  validUntil: '',
  role: 'group-user',
  groupId: '',
});
const createUserLoading = ref(false);

const availableRoles = computed(() => {
  if (isSysAdmin.value) {
    return [
      {
        label: $t('page.user-management.roleGroupAdmin'),
        value: ROLE_GROUP_ADMIN,
      },
      { label: $t('page.user-management.roleGroupUser'), value: 'group-user' },
    ];
  }
  return [
    { label: $t('page.user-management.roleGroupUser'), value: 'group-user' },
  ];
});

function openCreateUserModal() {
  createUserForm.value = {
    username: '',
    password: '',
    realName: '',
    email: '',
    validUntil: '',
    role: 'group-user',
    groupId: isSysAdmin.value ? selectedGroupId.value || '' : '',
  };
  showCreateUserModal.value = true;
}

async function handleCreateUser() {
  const f = createUserForm.value;
  if (
    !f.username ||
    !f.password ||
    !f.realName ||
    !f.email ||
    !f.validUntil ||
    !f.role
  ) {
    message.warning($t('page.user-management.fillRequired'));
    return;
  }
  if (isSysAdmin.value && !f.groupId) {
    message.warning($t('page.user-management.groupRequired'));
    return;
  }
  createUserLoading.value = true;
  try {
    await createUserApi(f);
    message.success($t('page.user-management.createUserSuccess'));
    showCreateUserModal.value = false;
    await fetchUsers();
  } catch {
    message.error($t('page.user-management.createUserFail'));
  } finally {
    createUserLoading.value = false;
  }
}

onMounted(async () => {
  await fetchGroups();
  await fetchUsers();
});
</script>

<template>
  <Page content-class="flex flex-col" auto-content-height>
    <Row :gutter="16" :wrap="false" class="min-h-0 flex-1">
      <!-- Left: group list (sys admin only) -->
      <Col v-if="isSysAdmin" :span="5" class="flex flex-col">
        <Card :title="$t('page.user-management.groupPanel')" class="flex-1">
          <div
            v-for="group in groups"
            :key="group.id"
            class="mb-2 cursor-pointer rounded-md p-3 transition-colors"
            :class="
              selectedGroupId === group.id
                ? 'border border-blue-200 bg-blue-50'
                : 'border border-transparent hover:bg-gray-50'
            "
            @click="handleGroupChange(group.id)"
          >
            <div class="font-medium">{{ group.name }}</div>
            <div class="mt-0.5 text-xs text-gray-400">
              {{ group.description }}
            </div>
          </div>
        </Card>
      </Col>

      <!-- Right: user table -->
      <Col :span="isSysAdmin ? 19 : 24" class="flex flex-col">
        <!-- Stats cards -->
        <Row :gutter="12" class="mb-4 shrink-0">
          <Col :span="6">
            <Card size="small" class="text-center">
              <div class="text-2xl font-bold text-blue-600">
                {{ groupStats.total }}
              </div>
              <div class="text-xs text-gray-500">
                {{ $t('page.user-management.totalUsers') }}
              </div>
            </Card>
          </Col>
          <Col :span="6">
            <Card size="small" class="text-center">
              <div class="text-2xl font-bold text-purple-600">
                {{ groupStats.adminCount }}
              </div>
              <div class="text-xs text-gray-500">
                {{ $t('page.user-management.groupAdmins') }}
              </div>
            </Card>
          </Col>
          <Col :span="6">
            <Card size="small" class="text-center">
              <div class="text-2xl font-bold text-green-600">
                {{ groupStats.activeCount }}
              </div>
              <div class="text-xs text-gray-500">
                {{ $t('page.user-management.activeUsers') }}
              </div>
            </Card>
          </Col>
          <Col :span="6">
            <Card size="small" class="text-center">
              <div class="text-2xl font-bold text-red-500">
                {{ groupStats.disabledCount }}
              </div>
              <div class="text-xs text-gray-500">
                {{ $t('page.user-management.disabledUsers') }}
              </div>
            </Card>
          </Col>
        </Row>

        <Card
          class="flex-1"
          :title="
            selectedGroup
              ? `${selectedGroup.name} · ${$t('page.user-management.memberList')}`
              : $t('page.user-management.memberList')
          "
        >
          <template #extra>
            <Space>
              <Input
                v-model:value="searchKeyword"
                allow-clear
                style="width: 260px"
                :placeholder="$t('page.user-management.searchPlaceholder')"
              />
              <Button
                v-if="isSysAdmin"
                type="default"
                @click="showCreateGroupModal = true"
              >
                + {{ $t('page.user-management.addGroup') }}
              </Button>
              <Button
                v-if="isSysAdmin || isGroupAdmin"
                type="primary"
                @click="openCreateUserModal"
              >
                + {{ $t('page.user-management.addUser') }}
              </Button>
            </Space>
          </template>
          <Spin :spinning="loading">
            <Table
              :columns="columns"
              :data-source="filteredUsers"
              :row-key="(r) => r.id"
              :pagination="{ pageSize: 10, showSizeChanger: false }"
              size="middle"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'username'">
                  <div class="flex items-center gap-2">
                    <Avatar
                      size="small"
                      :style="{ backgroundColor: '#1890ff' }"
                    >
                      {{ (record as UserListItem).realName.charAt(0) }}
                    </Avatar>
                    <span>{{ (record as UserListItem).username }}</span>
                  </div>
                </template>

                <template v-if="column.key === 'roles'">
                  <Tag :color="getRoleColor((record as UserListItem).roles)">
                    {{ getRoleLabel((record as UserListItem).roles) }}
                  </Tag>
                </template>

                <template v-if="column.key === 'status'">
                  <Badge
                    :status="
                      (record as UserListItem).status === 'active'
                        ? 'success'
                        : 'error'
                    "
                    :text="
                      (record as UserListItem).status === 'active'
                        ? $t('page.user-management.statusActive')
                        : $t('page.user-management.statusDisabled')
                    "
                  />
                </template>

                <template v-if="column.key === 'actions'">
                  <div class="flex gap-2">
                    <Dropdown v-if="canSetRole(record as UserListItem)">
                      <Button size="small" type="default">
                        {{ $t('page.user-management.setRole') }}
                      </Button>
                      <template #overlay>
                        <Menu>
                          <MenuItem
                            v-if="isSysAdmin"
                            @click="
                              handleSetRole(
                                (record as UserListItem).id,
                                'group-admin',
                              )
                            "
                          >
                            {{ $t('page.user-management.setGroupAdmin') }}
                          </MenuItem>
                          <MenuItem
                            @click="
                              handleSetRole(
                                (record as UserListItem).id,
                                'group-user',
                              )
                            "
                          >
                            {{ $t('page.user-management.setGroupUser') }}
                          </MenuItem>
                        </Menu>
                      </template>
                    </Dropdown>

                    <Tooltip
                      v-if="canToggleStatus(record as UserListItem)"
                      :title="
                        (record as UserListItem).status === 'active'
                          ? $t('page.user-management.disableUser')
                          : $t('page.user-management.enableUser')
                      "
                    >
                      <Button
                        size="small"
                        :danger="(record as UserListItem).status === 'active'"
                        :type="
                          (record as UserListItem).status === 'active'
                            ? 'default'
                            : 'primary'
                        "
                        @click="handleToggleStatus(record as UserListItem)"
                      >
                        {{
                          (record as UserListItem).status === 'active'
                            ? $t('page.user-management.disable')
                            : $t('page.user-management.enable')
                        }}
                      </Button>
                    </Tooltip>
                  </div>
                </template>
              </template>
            </Table>
          </Spin>
        </Card>
      </Col>
    </Row>

    <!-- Create Group Modal -->
    <Modal
      v-model:open="showCreateGroupModal"
      :title="$t('page.user-management.addGroup')"
      :confirm-loading="createGroupLoading"
      @ok="handleCreateGroup"
      @cancel="createGroupForm = { name: '', description: '' }"
    >
      <Form layout="vertical" class="mt-4">
        <FormItem :label="$t('page.user-management.groupName')" required>
          <Input
            v-model:value="createGroupForm.name"
            :placeholder="$t('page.user-management.groupNamePlaceholder')"
          />
        </FormItem>
        <FormItem :label="$t('page.user-management.groupDesc')">
          <Input
            v-model:value="createGroupForm.description"
            :placeholder="$t('page.user-management.groupDescPlaceholder')"
          />
        </FormItem>
      </Form>
    </Modal>

    <!-- Create User Modal -->
    <Modal
      v-model:open="showCreateUserModal"
      :title="$t('page.user-management.addUser')"
      :confirm-loading="createUserLoading"
      @ok="handleCreateUser"
    >
      <Form layout="vertical" class="mt-4">
        <Row :gutter="16">
          <Col :span="12">
            <FormItem :label="$t('page.user-management.username')" required>
              <Input
                v-model:value="createUserForm.username"
                :placeholder="$t('page.user-management.usernamePlaceholder')"
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <FormItem :label="$t('page.user-management.password')" required>
              <InputPassword
                v-model:value="createUserForm.password"
                :placeholder="$t('page.user-management.passwordPlaceholder')"
              />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="16">
          <Col :span="12">
            <FormItem :label="$t('page.user-management.realName')" required>
              <Input
                v-model:value="createUserForm.realName"
                :placeholder="$t('page.user-management.realNamePlaceholder')"
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <FormItem :label="$t('page.user-management.email')" required>
              <Input
                v-model:value="createUserForm.email"
                :placeholder="$t('page.user-management.emailPlaceholder')"
              />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="16">
          <Col :span="12">
            <FormItem :label="$t('page.user-management.validUntil')" required>
              <DatePicker
                v-model:value="createUserForm.validUntil"
                value-format="YYYY-MM-DD"
                style="width: 100%"
                :placeholder="$t('page.user-management.validUntilPlaceholder')"
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <FormItem :label="$t('page.user-management.role')" required>
              <Select
                v-model:value="createUserForm.role"
                style="width: 100%"
                :placeholder="$t('page.user-management.selectRole')"
              >
                <SelectOption
                  v-for="r in availableRoles"
                  :key="r.value"
                  :value="r.value"
                >
                  {{ r.label }}
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
            v-model:value="createUserForm.groupId"
            style="width: 100%"
            :placeholder="$t('page.user-management.selectGroup')"
          >
            <SelectOption v-for="g in groups" :key="g.id" :value="g.id">
              {{ g.name }}
            </SelectOption>
          </Select>
        </FormItem>
      </Form>
    </Modal>
  </Page>
</template>
