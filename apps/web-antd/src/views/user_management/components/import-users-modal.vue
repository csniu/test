<script lang="ts" setup>
import type { GroupInfo } from '#/api/core/user-management';

import { computed, ref, watch } from 'vue';

import {
  Button,
  Form,
  FormItem,
  message,
  Modal,
  Space,
  Table,
  Tag,
} from 'ant-design-vue';
import dayjs from 'dayjs';

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

const IMPORT_TEMPLATE_HEADERS = [
  'username',
  'realName',
  'email',
  'password',
  'validUntil',
  'role',
  'groupId',
] as const;

type ImportRowData = Record<(typeof IMPORT_TEMPLATE_HEADERS)[number], string>;

interface ImportPreviewItem {
  email: string;
  errors: string[];
  groupId: string;
  password: string;
  realName: string;
  role: string;
  rowNo: number;
  username: string;
  validUntil: string;
}

const modalOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
});

const loading = ref(false);
const sourceName = ref('');
const rows = ref<ImportRowData[]>([]);
const fileInput = ref<HTMLInputElement>();
const headerError = ref('');

const templateColumns = computed(() => IMPORT_TEMPLATE_HEADERS.join(', '));

const previewColumns = computed(() => {
  const base = [
    { title: '#', dataIndex: 'rowNo', key: 'rowNo', width: 72 },
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
      title: $t('page.user-management.email'),
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: $t('page.user-management.role'),
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: $t('page.user-management.validUntil'),
      dataIndex: 'validUntil',
      key: 'validUntil',
    },
  ];

  if (props.isSysAdmin) {
    base.push({
      title: $t('page.user-management.groupPanel'),
      dataIndex: 'groupId',
      key: 'groupId',
    });
  }

  base.push({
    title: $t('page.user-management.importErrors'),
    dataIndex: 'errors',
    key: 'errors',
  });

  return base;
});

const usernameCounts = computed(() => {
  const counts = new Map<string, number>();
  for (const item of rows.value) {
    const username = normalizeImportCell(item.username).toLowerCase();
    if (!username) continue;
    counts.set(username, (counts.get(username) ?? 0) + 1);
  }
  return counts;
});

const resolvedRows = computed<ImportPreviewItem[]>(() => {
  return rows.value.map((row, index) => {
    const username = normalizeImportCell(row.username);
    const realName = normalizeImportCell(row.realName);
    const email = normalizeImportCell(row.email);
    const password = normalizeImportCell(row.password);
    const validUntil = normalizeImportedDate(row.validUntil);
    const role = resolveImportedRole(row.role);
    const groupId = resolveImportedGroupId(row.groupId);
    const errors: string[] = [];

    if (!username) {
      errors.push(
        $t('page.user-management.importMissingField', {
          field: $t('page.user-management.username'),
        }),
      );
    }
    if (!realName) {
      errors.push(
        $t('page.user-management.importMissingField', {
          field: $t('page.user-management.realName'),
        }),
      );
    }
    if (!email) {
      errors.push(
        $t('page.user-management.importMissingField', {
          field: $t('page.user-management.email'),
        }),
      );
    }
    if (!password) {
      errors.push(
        $t('page.user-management.importMissingField', {
          field: $t('page.user-management.password'),
        }),
      );
    }
    if (!validUntil) {
      errors.push(
        $t('page.user-management.importMissingField', {
          field: $t('page.user-management.validUntil'),
        }),
      );
    }
    if (!role) {
      errors.push($t('page.user-management.importRoleRestricted'));
    }
    if (props.isSysAdmin && !groupId) {
      errors.push($t('page.user-management.importGroupRequired'));
    }

    const duplicateCount = usernameCounts.value.get(
      username.trim().toLowerCase(),
    );
    if (username && duplicateCount && duplicateCount > 1) {
      errors.push($t('page.user-management.importDuplicateUsername'));
    }

    return {
      email,
      errors,
      groupId,
      password,
      realName,
      role,
      rowNo: index + 2,
      username,
      validUntil,
    };
  });
});

const previewRows = computed(() => resolvedRows.value.slice(0, 20));

const validCount = computed(
  () => resolvedRows.value.filter((item) => item.errors.length === 0).length,
);

const invalidCount = computed(
  () => resolvedRows.value.filter((item) => item.errors.length > 0).length,
);

function resetState() {
  sourceName.value = '';
  rows.value = [];
  headerError.value = '';
}

function handleCancel() {
  modalOpen.value = false;
  resetState();
}

function normalizeImportCell(value: string | undefined) {
  return value?.trim() ?? '';
}

function splitDelimitedLine(line: string, delimiter: string) {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index++) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        index++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === delimiter) {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function parseImportRows(text: string) {
  const normalizedText = text
    .replaceAll('\r\n', '\n')
    .replace(/^\uFEFF/, '')
    .trim();

  if (!normalizedText) return null;

  const lines = normalizedText.split('\n').filter((line) => line.trim());
  if (lines.length < 2) return null;

  const headers = splitDelimitedLine(lines[0]!, ',')
    .map((item) => item.trim())
    .filter(Boolean);

  const isExpectedHeader =
    headers.length === IMPORT_TEMPLATE_HEADERS.length &&
    IMPORT_TEMPLATE_HEADERS.every((header, index) => headers[index] === header);

  if (!isExpectedHeader) {
    return { headers, rows: [] };
  }

  const parsedRows = lines
    .slice(1)
    .map((line) => splitDelimitedLine(line, ','))
    .filter((cells) => cells.some((cell) => cell.trim()))
    .map((cells) => {
      return Object.fromEntries(
        IMPORT_TEMPLATE_HEADERS.map((header, index) => [
          header,
          normalizeImportCell(cells[index]),
        ]),
      ) as ImportRowData;
    });

  return { headers, rows: parsedRows };
}

function handleTemplateDownload() {
  const sampleGroupId = props.isSysAdmin
    ? props.selectedGroupId || props.groups[0]?.id || 'group-001'
    : '';
  const content = [
    IMPORT_TEMPLATE_HEADERS.join(','),
    [
      'demo.user',
      'Demo User',
      'demo@example.com',
      'Pass@123',
      dayjs().add(1, 'year').format('YYYY-MM-DD'),
      ROLE_GROUP_USER,
      sampleGroupId,
    ].join(','),
  ].join('\n');

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'user-import-template.csv';
  link.click();
  URL.revokeObjectURL(url);
}

function applyImportedFile(text: string, nextSourceName: string) {
  const parsed = parseImportRows(text);
  if (!parsed) {
    rows.value = [];
    headerError.value = '';
    message.warning($t('page.user-management.importEmptyData'));
    return;
  }

  const hasHeaderMismatch =
    parsed.headers.length !== IMPORT_TEMPLATE_HEADERS.length ||
    IMPORT_TEMPLATE_HEADERS.some(
      (header, index) => parsed.headers[index] !== header,
    );

  if (hasHeaderMismatch) {
    rows.value = [];
    sourceName.value = nextSourceName;
    headerError.value = $t('page.user-management.importTemplateInvalidDetail', {
      columns: templateColumns.value,
    });
    message.warning($t('page.user-management.importTemplateInvalid'));
    return;
  }

  rows.value = parsed.rows;
  sourceName.value = nextSourceName;
  headerError.value = '';
}

async function handleImportFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (!file.name.toLowerCase().endsWith('.csv')) {
    message.warning($t('page.user-management.importOnlyCsv'));
    target.value = '';
    return;
  }

  try {
    const text = await file.text();
    applyImportedFile(text, file.name);
  } catch {
    message.error($t('page.user-management.importReadFail'));
  } finally {
    target.value = '';
  }
}

function normalizeImportedDate(value: string) {
  const normalized = value.trim();
  if (!normalized) return '';

  const parsed = dayjs(normalized);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : '';
}

function normalizeRoleToken(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replaceAll(/[\s_-]/g, '');
}

function resolveImportedRole(value: string) {
  const rawRole = normalizeRoleToken(value);
  if (!rawRole) {
    return '';
  }

  if (!props.isSysAdmin) {
    return ['groupuser', 'member', ROLE_GROUP_USER].includes(rawRole)
      ? ROLE_GROUP_USER
      : '';
  }

  if (['groupadmin', ROLE_GROUP_ADMIN].includes(rawRole)) {
    return ROLE_GROUP_ADMIN;
  }
  if (['groupuser', 'member', ROLE_GROUP_USER].includes(rawRole)) {
    return ROLE_GROUP_USER;
  }
  return '';
}

function resolveImportedGroupId(value: string) {
  if (!props.isSysAdmin) {
    return props.selectedGroupId || props.groups[0]?.id || '';
  }

  const mappedGroup = normalizeImportCell(value);
  if (!mappedGroup) {
    return '';
  }

  const matchedGroup = props.groups.find(
    (group) =>
      group.id === mappedGroup ||
      group.name.trim().toLowerCase() === mappedGroup.trim().toLowerCase(),
  );

  return matchedGroup?.id ?? '';
}

async function handleImportUsers() {
  const validRows = resolvedRows.value.filter(
    (item) => item.errors.length === 0,
  );

  if (validRows.length === 0) {
    message.warning($t('page.user-management.importNeedValidRows'));
    return;
  }

  loading.value = true;
  let successCount = 0;
  let failCount = 0;

  try {
    for (const item of validRows) {
      try {
        await createUserApi({
          email: item.email,
          groupId: props.isSysAdmin ? item.groupId : undefined,
          password: item.password,
          realName: item.realName,
          role: item.role,
          username: item.username,
          validUntil: item.validUntil,
        });
        successCount++;
      } catch {
        failCount++;
      }
    }

    if (successCount > 0) {
      message.success(
        $t('page.user-management.importSuccessSummary', {
          count: successCount,
        }),
      );
      emit('success');
    }
    if (failCount > 0) {
      message.warning(
        $t('page.user-management.importFailSummary', {
          count: failCount,
        }),
      );
    }
    if (successCount > 0) {
      modalOpen.value = false;
      resetState();
    }
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.open,
  (opened) => {
    if (opened) {
      resetState();
    }
  },
);
</script>

<template>
  <Modal
    v-model:open="modalOpen"
    :title="$t('page.user-management.importUsers')"
    :confirm-loading="loading"
    width="1100px"
    @ok="handleImportUsers"
    @cancel="handleCancel"
  >
    <Form layout="vertical" class="mt-4">
      <FormItem :label="$t('page.user-management.importSource')">
        <Space wrap>
          <input
            ref="fileInput"
            accept=".csv"
            class="hidden"
            type="file"
            @change="handleImportFileChange"
          />
          <Button type="default" @click="handleTemplateDownload">
            {{ $t('page.user-management.importDownloadTemplate') }}
          </Button>
          <Button @click="fileInput?.click()">
            {{ $t('page.user-management.importSelectFile') }}
          </Button>
          <span class="text-xs text-gray-500">
            {{ $t('page.user-management.importHint') }}
          </span>
          <Tag v-if="sourceName" color="blue">
            {{ sourceName }}
          </Tag>
        </Space>
      </FormItem>

      <div
        class="rounded-md border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600"
      >
        <div>{{ $t('page.user-management.importTemplateColumns') }}</div>
        <div class="mt-1 font-mono text-xs text-gray-500">
          {{ templateColumns }}
        </div>
        <div v-if="headerError" class="mt-3 text-red-500">
          {{ headerError }}
        </div>
      </div>

      <div v-if="previewRows.length > 0" class="mt-2">
        <div class="mb-3 flex items-center justify-between">
          <div class="text-sm font-medium text-gray-800">
            {{ $t('page.user-management.importPreview') }}
          </div>
          <Space>
            <Tag color="green">
              {{
                $t('page.user-management.importReadyRows', {
                  count: validCount,
                })
              }}
            </Tag>
            <Tag color="red">
              {{
                $t('page.user-management.importInvalidRows', {
                  count: invalidCount,
                })
              }}
            </Tag>
          </Space>
        </div>

        <Table
          :columns="previewColumns"
          :data-source="previewRows"
          :pagination="false"
          row-key="rowNo"
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'role'">
              <Tag
                v-if="record.role"
                :color="record.role === ROLE_GROUP_ADMIN ? 'blue' : 'default'"
              >
                {{
                  record.role === ROLE_GROUP_ADMIN
                    ? $t('page.user-management.roleGroupAdmin')
                    : $t('page.user-management.roleGroupUser')
                }}
              </Tag>
              <span v-else class="text-gray-400">--</span>
            </template>
            <template v-if="column.key === 'errors'">
              <Space v-if="record.errors.length > 0" wrap>
                <Tag v-for="error in record.errors" :key="error" color="red">
                  {{ error }}
                </Tag>
              </Space>
              <Tag v-else color="green">
                {{ $t('page.user-management.importRowReady') }}
              </Tag>
            </template>
          </template>
        </Table>
      </div>
    </Form>
  </Modal>
</template>
