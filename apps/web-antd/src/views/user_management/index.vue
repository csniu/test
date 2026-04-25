<script lang="ts" setup>
import type { GroupInfo, UserListItem } from '#/api/core/user-management';

import { computed, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import {
  Button,
  Card,
  Col,
  Input,
  message,
  Modal,
  Row,
  Space,
} from 'ant-design-vue';

import {
  getUserGroupsApi,
  getUserListApi,
  updateUserRoleApi,
  updateUserStatusApi,
} from '#/api/core/user-management';
import { $t } from '#/locales';

import CreateGroupModal from './components/create-group-modal.vue';
import CreateUserModal from './components/create-user-modal.vue';
import GroupListPanel from './components/group-list-panel.vue';
import ImportUsersModal from './components/import-users-modal.vue';
import UserListTable from './components/user-list-table.vue';
import UserStatsCards from './components/user-stats-cards.vue';
import { ROLE_GROUP_ADMIN, ROLE_SYSTEM_ADMIN } from './constants';

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

const showCreateGroupModal = ref(false);
const showCreateUserModal = ref(false);
const showImportModal = ref(false);

onMounted(async () => {
  await fetchGroups();
  await fetchUsers();
});
</script>

<template>
  <Page content-class="flex flex-col" auto-content-height>
    <Row :gutter="16" :wrap="false" class="min-h-0 flex-1">
      <Col v-if="isSysAdmin" :span="5" class="flex flex-col">
        <GroupListPanel
          :groups="groups"
          :selected-group-id="selectedGroupId"
          @select="handleGroupChange"
        />
      </Col>

      <Col :span="isSysAdmin ? 19 : 24" class="flex flex-col">
        <UserStatsCards :stats="groupStats" />

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
                type="default"
                @click="showImportModal = true"
              >
                {{ $t('page.user-management.importUsers') }}
              </Button>
              <Button
                v-if="isSysAdmin || isGroupAdmin"
                type="primary"
                @click="showCreateUserModal = true"
              >
                + {{ $t('page.user-management.addUser') }}
              </Button>
            </Space>
          </template>
          <UserListTable
            :is-group-admin="isGroupAdmin"
            :is-sys-admin="isSysAdmin"
            :loading="loading"
            :users="filteredUsers"
            @set-role="handleSetRole"
            @toggle-status="handleToggleStatus"
          />
        </Card>
      </Col>
    </Row>

    <CreateGroupModal
      v-model:open="showCreateGroupModal"
      @success="fetchGroups"
    />
    <CreateUserModal
      v-model:open="showCreateUserModal"
      :groups="groups"
      :is-sys-admin="isSysAdmin"
      :selected-group-id="selectedGroupId"
      @success="fetchUsers"
    />
    <ImportUsersModal
      v-model:open="showImportModal"
      :groups="groups"
      :is-sys-admin="isSysAdmin"
      :selected-group-id="selectedGroupId"
      @success="fetchUsers"
    />
  </Page>
</template>
