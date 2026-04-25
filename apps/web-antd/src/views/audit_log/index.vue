<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page } from '@vben/common-ui';

import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getAuditLogListApi } from '#/api/core/audit-log';
import { $t } from '#/locales';

const gridOptions: VxeGridProps = {
  checkboxConfig: {
    highlight: true,
  },
  columns: [
    { title: $t('page.audit-log.colSeq'), type: 'seq', width: 50 },
    { type: 'checkbox', width: 50 },
    {
      field: 'category',
      sortable: true,
      title: $t('page.audit-log.colCategory'),
    },
    { field: 'color', sortable: true, title: $t('page.audit-log.colColor') },
    {
      field: 'productName',
      sortable: true,
      title: $t('page.audit-log.colProductName'),
    },
    { field: 'price', sortable: true, title: $t('page.audit-log.colPrice') },
    {
      field: 'releaseDate',
      formatter: 'formatDateTime',
      title: $t('page.audit-log.colDateTime'),
    },
  ],
  exportConfig: {},
  height: 'auto',
  keepSource: true,
  proxyConfig: {
    ajax: {
      query: async ({ page, sort, form }: any) => {
        return await getAuditLogListApi({
          page: page.currentPage,
          pageSize: page.pageSize,
          sortBy: sort.field,
          sortOrder: sort.order,
          ...form,
        });
      },
    },
    sort: true,
  },
  sortConfig: {
    defaultSort: { field: 'category', order: 'desc' },
    remote: true,
  },
  toolbarConfig: {
    custom: true,
    export: true,
    refresh: true,
    zoom: true,
  },
};

const formOptions: VbenFormProps = {
  collapsed: false,
  fieldMappingTime: [['date', ['start', 'end']]],
  schema: [
    {
      component: 'Input',
      fieldName: 'category',
      label: $t('page.audit-log.labelCategory'),
    },
    {
      component: 'Input',
      fieldName: 'productName',
      label: $t('page.audit-log.labelProductName'),
    },
    {
      component: 'Input',
      fieldName: 'price',
      label: $t('page.audit-log.labelPrice'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: 'Color1', value: '1' },
          { label: 'Color2', value: '2' },
        ],
        placeholder: $t('page.audit-log.colorPlaceholder'),
      },
      fieldName: 'color',
      label: $t('page.audit-log.labelColor'),
    },
    {
      component: 'RangePicker',
      defaultValue: [dayjs().subtract(7, 'days'), dayjs()],
      fieldName: 'date',
      label: $t('page.audit-log.labelDate'),
    },
  ],
  showCollapseButton: true,
  submitOnChange: true,
  submitOnEnter: false,
};

const [Grid] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});
</script>

<template>
  <Page auto-content-height>
    <Grid />
  </Page>
</template>
