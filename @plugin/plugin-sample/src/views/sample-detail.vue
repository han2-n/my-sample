<!-- Sample Detail Component -->
<script lang="ts" setup>
import type { SampleItem } from '../types';

import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { $t } from '@vben/locales';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Descriptions,
  Divider,
  message,
  Modal,
  PageHeader,
  Space,
  Tag,
} from 'ant-design-vue';

import { SampleForm } from '../components';
import { useSampleStore } from '../store';

defineOptions({
  name: 'SampleDetail',
});

const route = useRoute();
const router = useRouter();
const sampleStore = useSampleStore();
const loading = ref(false);
const item = ref<null | SampleItem>(null);
const showEditModal = ref(false);

const id = computed(() => route.params.id as string);

async function fetchData() {
  loading.value = true;
  try {
    const result = await sampleStore.getItem(id.value);
    item.value = result;
  } catch (error) {
    console.error('Failed to load item:', error);
    message.error($t('sample.messages.loadFailed'));
  } finally {
    loading.value = false;
  }
}

function handleGoBack() {
  router.back();
}

function handleEdit() {
  showEditModal.value = true;
}

async function handleDelete() {
  try {
    await sampleStore.deleteItem(id.value);
    message.success($t('sample.messages.deleteSuccess'));
    router.push({ name: 'SampleList' });
  } catch (error) {
    console.error('Delete failed:', error);
    message.error($t('sample.messages.deleteFailed'));
  }
}

function handleFormSuccess(updatedItem: SampleItem) {
  item.value = updatedItem;
  showEditModal.value = false;
  message.success($t('sample.messages.updateSuccess'));
}

function handleFormCancel() {
  showEditModal.value = false;
}

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="sample-detail">
    <PageHeader :title="$t('sample.detail.title')" @back="handleGoBack">
      <template #extra>
        <Space>
          <Button type="primary" @click="handleEdit">
            <template #icon><EditOutlined /></template>
            {{ $t('sample.actions.edit') }}
          </Button>

          <Button danger @click="handleDelete">
            <template #icon><DeleteOutlined /></template>
            {{ $t('sample.actions.delete') }}
          </Button>
        </Space>
      </template>
    </PageHeader>

    <Card v-if="item" class="mt-4" loading="{loading}">
      <Descriptions bordered>
        <Descriptions.Item label="ID" span="{3}">
          {{ item.id }}
        </Descriptions.Item>

        <Descriptions.Item :label="$t('sample.detail.title')" span="{3}">
          {{ item.title }}
        </Descriptions.Item>

        <Descriptions.Item :label="$t('sample.detail.description')" span="{3}">
          {{ item.description || $t('sample.noDescription') }}
        </Descriptions.Item>

        <Descriptions.Item :label="$t('sample.detail.status')">
          <Tag
            :color="
              item.status === 'active'
                ? 'success'
                : item.status === 'inactive'
                  ? 'default'
                  : 'warning'
            "
          >
            {{ $t(`sample.status.${item.status}`) }}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item :label="$t('sample.detail.createdAt')">
          {{ new Date(item.createdAt).toLocaleString() }}
        </Descriptions.Item>

        <Descriptions.Item :label="$t('sample.detail.updatedAt')">
          {{ new Date(item.updatedAt).toLocaleString() }}
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      <div v-if="item.tags && item.tags.length > 0">
        <h3>{{ $t('sample.detail.tags') }}</h3>
        <Space>
          <Tag v-for="tag in item.tags" :key="tag">{{ tag }}</Tag>
        </Space>
      </div>
    </Card>

    <Card v-else class="mt-4" loading="{loading}">
      <div v-if="!loading" class="py-8 text-center">
        <p>{{ $t('sample.notFound') }}</p>
        <Button type="primary" @click="handleGoBack">
          {{ $t('sample.actions.backToList') }}
        </Button>
      </div>
    </Card>

    <!-- Edit Modal -->
    <Modal
      v-if="item"
      v-model:visible="showEditModal"
      :title="$t('sample.modal.edit')"
      :width="800"
      :footer="null"
      @cancel="handleFormCancel"
    >
      <SampleForm
        :id="id"
        mode="edit"
        @success="handleFormSuccess"
        @cancel="handleFormCancel"
      />
    </Modal>
  </div>
</template>

<style scoped>
.sample-detail {
  padding: 16px;
}
</style>
