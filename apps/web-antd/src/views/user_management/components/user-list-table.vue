<script lang="ts" setup>
import type { UserListItem } from '#/api/core/user-management';

import { computed } from 'vue';

import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Menu,
  MenuItem,
  Spin,
  Table,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { $t } from '#/locales';

import { ROLE_GROUP_ADMIN, ROLE_GROUP_USER, ROLE_SYSTEM_ADMIN } from '../constants';

const props = defineProps<{
  isGroupAdmin: boolean;
  isSysAdmin: boolean;
  loading: boolean;
  users: UserListItem[];
}>();

const emit = defineEmits<{
  'set-role': [userId: number, role: string];
  'toggle-status': [user: UserListItem];
}>();

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

  if (props.isSysAdmin || props.isGroupAdmin) {
    base.push({
      title: $t('page.user-management.actions'),
      dataIndex: 'actions',
      key: 'actions',
    });
  }

  return base;
});

function getRoleLabel(roles: string[]) {
  if (roles.includes(ROLE_SYSTEM_ADMIN)) {
    return $t('page.user-management.roleSysAdmin');
  }
  if (roles.includes(ROLE_GROUP_ADMIN)) {
    return $t('page.user-management.roleGroupAdmin');
  }
  return $t('page.user-management.roleGroupUser');
}

function getRoleColor(roles: string[]) {
  if (roles.includes(ROLE_SYSTEM_ADMIN)) return 'red';
  if (roles.includes(ROLE_GROUP_ADMIN)) return 'blue';
  return 'default';
}

function canSetRole(target: UserListItem) {
  if (props.isSysAdmin) return !target.roles.includes(ROLE_SYSTEM_ADMIN);
  if (props.isGroupAdmin) {
    return (
      !target.roles.includes(ROLE_GROUP_ADMIN) &&
      !target.roles.includes(ROLE_SYSTEM_ADMIN)
    );
  }
  return false;
}

function canToggleStatus(target: UserListItem) {
  if (target.roles.includes(ROLE_SYSTEM_ADMIN)) return false;
  if (props.isSysAdmin) return true;
  if (props.isGroupAdmin) {
    return !target.roles.includes(ROLE_GROUP_ADMIN);
  }
  return false;
}
</script>

<template>
  <Spin :spinning="loading">
    <Table
      :columns="columns"
      :data-source="users"
      :row-key="(record: UserListItem) => record.id"
      :pagination="{ pageSize: 10, showSizeChanger: false }"
      size="middle"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'username'">
          <div class="flex items-center gap-2">
            <Avatar size="small" :style="{ backgroundColor: '#1890ff' }">
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
              (record as UserListItem).status === 'active' ? 'success' : 'error'
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
                    @click="emit('set-role', (record as UserListItem).id, ROLE_GROUP_ADMIN)"
                  >
                    {{ $t('page.user-management.setGroupAdmin') }}
                  </MenuItem>
                  <MenuItem
                    @click="emit('set-role', (record as UserListItem).id, ROLE_GROUP_USER)"
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
                @click="emit('toggle-status', record as UserListItem)"
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
</template>
