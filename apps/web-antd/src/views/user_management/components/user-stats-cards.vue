<script lang="ts" setup>
import { Card, Col, Row } from 'ant-design-vue';

import { $t } from '#/locales';

defineProps<{
  stats: {
    adminCount: number;
    activeCount: number;
    disabledCount: number;
    total: number;
  };
}>();
</script>

<template>
  <Row :gutter="12" class="mb-4 shrink-0">
    <Col :span="6">
      <Card size="small" class="text-center">
        <div class="text-2xl font-bold text-blue-600">
          {{ stats.total }}
        </div>
        <div class="text-xs text-gray-500">
          {{ $t('page.user-management.totalUsers') }}
        </div>
      </Card>
    </Col>
    <Col :span="6">
      <Card size="small" class="text-center">
        <div class="text-2xl font-bold text-purple-600">
          {{ stats.adminCount }}
        </div>
        <div class="text-xs text-gray-500">
          {{ $t('page.user-management.groupAdmins') }}
        </div>
      </Card>
    </Col>
    <Col :span="6">
      <Card size="small" class="text-center">
        <div class="text-2xl font-bold text-green-600">
          {{ stats.activeCount }}
        </div>
        <div class="text-xs text-gray-500">
          {{ $t('page.user-management.activeUsers') }}
        </div>
      </Card>
    </Col>
    <Col :span="6">
      <Card size="small" class="text-center">
        <div class="text-2xl font-bold text-red-500">
          {{ stats.disabledCount }}
        </div>
        <div class="text-xs text-gray-500">
          {{ $t('page.user-management.disabledUsers') }}
        </div>
      </Card>
    </Col>
  </Row>
</template>
