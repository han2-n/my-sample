<script lang="ts" setup>
import { computed } from 'vue';

import { $t } from '@vben/locales';

import { Button, Card, Space, Tag } from 'ant-design-vue';

defineOptions({
  name: 'SampleCard',
});

const props = defineProps<{
  description?: string;
  status?: 'active' | 'inactive' | 'pending';
  tags?: string[];
  title: string;
}>();

const emit = defineEmits<{
  edit: [];
  view: [];
}>();

const statusColor = computed(() => {
  switch (props.status) {
    case 'active': {
      return 'success';
    }
    case 'inactive': {
      return 'default';
    }
    case 'pending': {
      return 'warning';
    }
    default: {
      return 'default';
    }
  }
});

const statusText = computed(() => {
  return props.status ? $t(`sample.status.${props.status}`) : '';
});
</script>

<template>
  <Card :bordered="true" class="sample-card" hoverable>
    <template #title>
      <div class="flex items-center justify-between">
        <span>{{ title }}</span>
        <Tag v-if="status" :color="statusColor">{{ statusText }}</Tag>
      </div>
    </template>

    <div class="sample-card-content">
      <p v-if="description">{{ description }}</p>
      <p v-else class="text-gray-400">{{ $t('sample.noDescription') }}</p>

      <div v-if="tags && tags.length > 0" class="sample-card-tags mt-4">
        <Space>
          <Tag v-for="tag in tags" :key="tag">{{ tag }}</Tag>
        </Space>
      </div>

      <div class="sample-card-actions mt-4 flex justify-end">
        <Space>
          <Button type="default" @click="emit('view')">
            {{ $t('sample.actions.view') }}
          </Button>
          <Button type="primary" @click="emit('edit')">
            {{ $t('sample.actions.edit') }}
          </Button>
        </Space>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.sample-card {
  width: 100%;
  margin-bottom: 16px;
}

.sample-card-content {
  min-height: 120px;
}
</style>
