<script lang="ts" setup>
import type { GroupInfo, UserListItem } from '#/api/core/user-management';

import { computed, onMounted, ref } from 'vue';

import { useUserStore } from '@vben/stores';

import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Dropdown,
  Menu,
  MenuItem,
  message,
  Modal,
  Row,
  Spin,
  Table,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import {
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

onMounted(async () => {
  await fetchGroups();
  await fetchUsers();
});
</script>

<template>
  <div class="p-5">
    <div class="mb-5 flex items-center justify-between">
      <div>
        <h2 class="m-0 text-xl font-semibold">
          {{ $t('page.user-management.title') }}
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          <template v-if="isSysAdmin">
            {{ $t('page.user-management.descSysAdmin') }}
          </template>
          <template v-else-if="isGroupAdmin">
            {{ $t('page.user-management.descGroupAdmin') }}
          </template>
          <template v-else>{{ $t('page.user-management.descUser') }}</template>
        </p>
      </div>
    </div>

    <Row :gutter="16">
      <!-- Left: group list (sys admin only) -->
      <Col v-if="isSysAdmin" :span="5">
        <Card :title="$t('page.user-management.groupPanel')" class="h-full">
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
      <Col :span="isSysAdmin ? 19 : 24">
        <!-- Stats cards -->
        <Row :gutter="12" class="mb-4">
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
          :title="
            selectedGroup
              ? `${selectedGroup.name} · ${$t('page.user-management.memberList')}`
              : $t('page.user-management.memberList')
          "
        >
          <Spin :spinning="loading">
            <Table
              :columns="columns"
              :data-source="users"
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
  </div>
</template>
