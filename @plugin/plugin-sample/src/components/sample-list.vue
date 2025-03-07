<!-- Sample List Component -->
<script lang="ts" setup>
import type { SampleItem } from '../types';

import { computed, onMounted, ref } from 'vue';

import { $t } from '@vben/locales';

import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue';
import { Button, Input, Select, Space, Table, Tag } from 'ant-design-vue';

import { useSampleStore } from '../store';

defineOptions({
  name: 'SampleList',
});

const emit = defineEmits<{
  add: [];
  delete: [id: string];
  edit: [id: string];
  view: [id: string];
}>();

const sampleStore = useSampleStore();
const searchText = ref('');
const statusFilter = ref('all');
const loading = ref(false);

const dataSource = computed(() => {
  let filtered = [...sampleStore.items];

  // Apply search filter
  if (searchText.value) {
    const search = searchText.value.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search),
    );
  }

  // Apply status filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter((item) => item.status === statusFilter.value);
  }

  return filtered;
});

const columns = [
  {
    dataIndex: 'title',
    key: 'title',
    title: () => $t('sample.table.title'),
  },
  {
    dataIndex: 'description',
    ellipsis: true,
    key: 'description',
    title: () => $t('sample.table.description'),
  },
  {
    customRender: ({ text }: { text: string }) => {
      const color =
        text === 'active'
          ? 'success'
          : (text === 'inactive'
            ? 'default'
            : 'warning');
      return <Tag color={color}>{$t(`sample.status.${text}`)}</Tag>;
    },
    dataIndex: 'status',
    key: 'status',
    title: () => $t('sample.table.status'),
    width: 120,
  },
  {
    customRender: ({ text }: { text: string[] }) => (
      <Space>{text?.map((tag) => <Tag key={tag}>{tag}</Tag>)}</Space>
    ),
    dataIndex: 'tags',
    key: 'tags',
    title: () => $t('sample.table.tags'),
    width: 200,
  },
  {
    customRender: ({ record }: { record: SampleItem }) => (
      <Space>
        <Button onClick={() => handleView(record.id)} type="link">
          {$t('sample.actions.view')}
        </Button>
        <Button onClick={() => handleEdit(record.id)} type="link">
          {$t('sample.actions.edit')}
        </Button>
        <Button danger onClick={() => handleDelete(record.id)} type="link">
          {$t('sample.actions.delete')}
        </Button>
      </Space>
    ),
    key: 'action',
    title: () => $t('sample.table.actions'),
    width: 200,
  },
];

async function fetchData() {
  loading.value = true;
  try {
    await sampleStore.fetchItems();
  } finally {
    loading.value = false;
  }
}

function handleAdd() {
  emit('add');
}

function handleView(id: string) {
  emit('view', id);
}

function handleEdit(id: string) {
  emit('edit', id);
}

function handleDelete(id: string) {
  emit('delete', id);
}

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="sample-list">
    <div class="sample-list-header mb-4 flex justify-between">
      <div class="sample-list-filters flex gap-4">
        <Input
          v-model:value="searchText"
          placeholder="Search..."
          style="width: 200px"
          allow-clear
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </Input>

        <Select
          v-model:value="statusFilter"
          style="width: 120px"
          :options="[
            { value: 'all', label: $t('sample.filter.all') },
            { value: 'active', label: $t('sample.status.active') },
            { value: 'inactive', label: $t('sample.status.inactive') },
            { value: 'pending', label: $t('sample.status.pending') },
          ]"
        />
      </div>

      <div class="sample-list-actions">
        <Space>
          <Button @click="fetchData">
            <template #icon><ReloadOutlined /></template>
            {{ $t('sample.actions.refresh') }}
          </Button>

          <Button type="primary" @click="handleAdd">
            <template #icon><PlusOutlined /></template>
            {{ $t('sample.actions.add') }}
          </Button>
        </Space>
      </div>
    </div>

    <Table
      :loading="loading"
      :columns="columns"
      :data-source="dataSource"
      row-key="id"
      :pagination="{
        showSizeChanger: true,
        showQuickJumper: true,
        defaultPageSize: 10,
        pageSizeOptions: ['10', '20', '50', '100'],
      }"
    />
  </div>
</template>

<style scoped>
.sample-list {
  width: 100%;
}
</style>
