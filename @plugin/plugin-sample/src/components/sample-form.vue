<script lang="ts" setup>
import type { SampleItem } from '../types';

import { reactive, ref, watch } from 'vue';

import { $t } from '@vben/locales';

import { PlusOutlined } from '@ant-design/icons-vue';
import {
  Button,
  Divider,
  Form,
  Input,
  message,
  Select,
  Space,
  Tag,
} from 'ant-design-vue';

import { useSampleStore } from '../store';

defineOptions({
  name: 'SampleForm',
});

const props = defineProps<{
  id?: string;
  mode: 'create' | 'edit';
}>();

const emit = defineEmits<{
  cancel: [];
  success: [item: SampleItem];
}>();

const formRef = ref();
const sampleStore = useSampleStore();
const loading = ref(false);
const newTag = ref('');
const inputVisible = ref(false);
const inputRef = ref(null);

const formModel = reactive<Partial<SampleItem>>({
  description: '',
  status: 'pending',
  tags: [],
  title: '',
});

// Load data if in edit mode
watch(
  () => props.id,
  async () => {
    if (props.mode === 'edit' && props.id) {
      loading.value = true;
      try {
        const item = await sampleStore.getItem(props.id);
        if (item) {
          Object.assign(formModel, item);
        }
      } catch (error) {
        console.error('Failed to load item:', error);
        message.error($t('sample.messages.loadFailed'));
      } finally {
        loading.value = false;
      }
    }
  },
  { immediate: true },
);

const formRules = {
  description: [
    {
      max: 500,
      message: $t('sample.validation.descriptionLength'),
      trigger: 'blur',
    },
  ],
  status: [
    {
      message: $t('sample.validation.statusRequired'),
      required: true,
      trigger: 'change',
    },
  ],
  title: [
    {
      message: $t('sample.validation.titleRequired'),
      required: true,
      trigger: 'blur',
    },
    {
      max: 100,
      message: $t('sample.validation.titleLength'),
      min: 3,
      trigger: 'blur',
    },
  ],
};

const statusOptions = [
  { label: $t('sample.status.active'), value: 'active' },
  { label: $t('sample.status.inactive'), value: 'inactive' },
  { label: $t('sample.status.pending'), value: 'pending' },
];

async function handleSubmit() {
  try {
    if (formRef.value) {
      await formRef.value.validate();
    }

    loading.value = true;

    let result: SampleItem;

    if (props.mode === 'create') {
      // Create new item
      result = await sampleStore.createItem({
        ...formModel,
        id: '', // Will be generated on the server
      } as SampleItem);

      message.success($t('sample.messages.createSuccess'));
    } else {
      // Update existing item
      result = await sampleStore.updateItem(props.id!, formModel as SampleItem);
      message.success($t('sample.messages.updateSuccess'));
    }

    emit('success', result);
  } catch (error) {
    console.error('Form submission failed:', error);
    message.error(
      props.mode === 'create'
        ? $t('sample.messages.createFailed')
        : $t('sample.messages.updateFailed'),
    );
  } finally {
    loading.value = false;
  }
}

function handleCancel() {
  emit('cancel');
}

function handleRemoveTag(tag: string) {
  const index = formModel.tags?.indexOf(tag);
  if (index !== undefined && index !== -1) {
    formModel.tags?.splice(index, 1);
  }
}

function showInput() {
  inputVisible.value = true;
  setTimeout(() => {
    inputRef.value?.focus();
  }, 100);
}

function handleInputConfirm() {
  if (newTag.value && !formModel.tags?.includes(newTag.value)) {
    formModel.tags = [...(formModel.tags || []), newTag.value];
  }
  inputVisible.value = false;
  newTag.value = '';
}
</script>

<template>
  <div class="sample-form">
    <Form
      ref="formRef"
      :model="formModel"
      :rules="formRules"
      layout="vertical"
      :label-col="{ span: 24 }"
      :wrapper-col="{ span: 24 }"
    >
      <Form.Item name="title" :label="$t('sample.form.title')" required>
        <Input v-model:value="formModel.title" />
      </Form.Item>

      <Form.Item name="description" :label="$t('sample.form.description')">
        <Input.TextArea
          v-model:value="formModel.description"
          :rows="4"
          :placeholder="$t('sample.form.descriptionPlaceholder')"
        />
      </Form.Item>

      <Form.Item name="status" :label="$t('sample.form.status')" required>
        <Select v-model:value="formModel.status" :options="statusOptions" />
      </Form.Item>

      <Form.Item name="tags" :label="$t('sample.form.tags')">
        <div>
          <template v-if="formModel.tags?.length">
            <Space wrap>
              <Tag
                v-for="tag in formModel.tags"
                :key="tag"
                :closable="true"
                @close="handleRemoveTag(tag)"
              >
                {{ tag }}
              </Tag>
            </Space>
          </template>

          <Input
            v-if="inputVisible"
            ref="inputRef"
            v-model:value="newTag"
            style="width: 120px"
            size="small"
            @blur="handleInputConfirm"
            @keyup.enter="handleInputConfirm"
          />
          <Tag v-else style="cursor: pointer" @click="showInput">
            <PlusOutlined /> {{ $t('sample.form.newTag') }}
          </Tag>
        </div>
      </Form.Item>

      <Divider />

      <Form.Item>
        <Space>
          <Button type="primary" :loading="loading" @click="handleSubmit">
            {{
              props.mode === 'create'
                ? $t('sample.actions.create')
                : $t('sample.actions.update')
            }}
          </Button>
          <Button @click="handleCancel">
            {{ $t('sample.actions.cancel') }}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  </div>
</template>

<style scoped>
.sample-form {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}
</style>
