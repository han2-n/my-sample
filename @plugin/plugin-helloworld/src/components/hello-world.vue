<script lang="ts" setup>
import { ref } from 'vue';

import { $t } from '@vben/locales';

// State
const count = ref(0);

// Methods
const increment = () => {
  count.value++;
};

const decrement = () => {
  if (count.value > 0) {
    count.value--;
  }
};

const reset = () => {
  count.value = 0;
};

const formatDate = (date: Date): string => {
  return date.toLocaleString();
};
</script>

<template>
  <div class="hello-world-component">
    <h1>{{ $t('helloWorld.title') }}</h1>
    <p>{{ $t('helloWorld.welcome') }}</p>

    <div class="counter-container">
      <p>{{ $t('helloWorld.counter') }}: {{ count }}</p>

      <div class="button-group">
        <a-button type="primary" @click="increment">
          {{ $t('helloWorld.increment') }}
        </a-button>

        <a-button @click="decrement" :disabled="count <= 0">
          {{ $t('helloWorld.decrement') }}
        </a-button>

        <a-button @click="reset">
          {{ $t('helloWorld.reset') }}
        </a-button>
      </div>
    </div>

    <p class="created-at">
      {{ $t('helloWorld.createdAt') }}: {{ formatDate(new Date()) }}
    </p>
  </div>
</template>

<style scoped>
.hello-world-component {
  max-width: 600px;
  padding: 20px;
  margin: 0 auto;
  text-align: center;
}

h1 {
  margin-bottom: 16px;
  color: #1890ff;
}

.counter-container {
  padding: 20px;
  margin: 20px 0;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.button-group {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 16px;
}

.created-at {
  margin-top: 20px;
  font-size: 12px;
  color: #999;
}
</style>
