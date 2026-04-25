<script lang="ts" setup>
import type { GroupInfo } from '#/api/core/user-management';

import { Card } from 'ant-design-vue';

import { $t } from '#/locales';

defineProps<{
  groups: GroupInfo[];
  selectedGroupId: string;
}>();

const emit = defineEmits<{
  select: [groupId: string];
}>();
</script>

<template>
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
      @click="emit('select', group.id)"
    >
      <div class="font-medium">{{ group.name }}</div>
      <div class="mt-0.5 text-xs text-gray-400">
        {{ group.description }}
      </div>
    </div>
  </Card>
</template>
