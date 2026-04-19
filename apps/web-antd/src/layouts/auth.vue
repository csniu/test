<script lang="ts" setup>
// import { computed } from 'vue';

import { AuthPageLayout } from '@vben/layouts';
// import { preferences } from '@vben/preferences';

// import { $t } from '#/locales';

// const appName = computed(() => preferences.app.name);
// const logo = computed(() => preferences.logo.source);
// const logoDark = computed(() => preferences.logo.sourceDark);
</script>

<template>
  <AuthPageLayout
    :copyright="false"
    :toolbar="true"
    :toolbar-list="['language', 'theme']"
  >
    <!-- 自定义工具栏 -->
    <!-- <template #toolbar></template> -->
  </AuthPageLayout>
</template>
