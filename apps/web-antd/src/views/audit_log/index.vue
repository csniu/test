<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page } from '@vben/common-ui';

import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

interface RowType {
  category: string;
  color: string;
  id: string;
  price: string;
  productName: string;
  releaseDate: string;
}

function getExampleTableApi(params: {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: string;
}) {
  return new Promise<{ list: RowType[]; total: number }>((resolve) => {
    setTimeout(() => {
      const data: RowType[] = [];
      for (let i = 0; i < params.pageSize; i++) {
        const index = (params.page - 1) * params.pageSize + i + 1;
        data.push({
          id: `${index}`,
          category: `Category ${index}`,
          color: `Color ${index}`,
          productName: `Product ${index}`,
          price: `$${(Math.random() * 100).toFixed(2)}`,
          releaseDate: new Date(
            Date.now() - Math.random() * 10_000_000_000,
          ).toISOString(),
        });
      }
      resolve({ list: data, total: 1000 });
    }, 1000);
  });
}

const gridOptions: VxeGridProps<RowType> = {
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { align: 'left', title: 'Name', type: 'checkbox', width: 100 },
    { field: 'category', sortable: true, title: 'Category' },
    { field: 'color', sortable: true, title: 'Color' },
    { field: 'productName', sortable: true, title: 'Product Name' },
    { field: 'price', sortable: true, title: 'Price' },
    { field: 'releaseDate', formatter: 'formatDateTime', title: 'DateTime' },
  ],
  exportConfig: {},
  height: 'auto',
  keepSource: true,
  proxyConfig: {
    ajax: {
      query: async ({ page, sort }) => {
        return await getExampleTableApi({
          page: page.currentPage,
          pageSize: page.pageSize,
          sortBy: sort.field,
          sortOrder: sort.order,
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
    // import: true,
    refresh: true,
    zoom: true,
  },
};

const formOptions: VbenFormProps = {
  // 默认展开
  collapsed: false,
  fieldMappingTime: [['date', ['start', 'end']]],
  schema: [
    {
      component: 'Input',
      defaultValue: '1',
      fieldName: 'category',
      label: 'Category',
    },
    {
      component: 'Input',
      fieldName: 'productName',
      label: 'ProductName',
    },
    {
      component: 'Input',
      fieldName: 'price',
      label: 'Price',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          {
            label: 'Color1',
            value: '1',
          },
          {
            label: 'Color2',
            value: '2',
          },
        ],
        placeholder: '请选择',
      },
      fieldName: 'color',
      label: 'Color',
    },
    {
      component: 'RangePicker',
      defaultValue: [dayjs().subtract(7, 'days'), dayjs()],
      fieldName: 'date',
      label: 'Date',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 是否在字段值改变时提交表单
  submitOnChange: true,
  // 按下回车时是否提交表单
  submitOnEnter: false,
};

const [Grid] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-tools>
      </template>
    </Grid>
  </Page>
</template>
