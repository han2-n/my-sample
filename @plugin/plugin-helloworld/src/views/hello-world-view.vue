<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import HelloWorld from '../components/hello-world.vue';

const { t } = useI18n();
</script>

<template>
  <div class="hello-world-view">
    <a-card class="hello-card">
      <template #title>
        <div class="card-title">
          {{ t('helloWorld.pageTitle') }}
        </div>
      </template>

      <template #extra>
        <a-tag color="blue">{{ t('helloWorld.version') }}: 1.0.0</a-tag>
      </template>

      <div class="card-content">
        <HelloWorld />

        <a-divider />

        <a-alert
          type="info"
          show-icon
          :message="t('helloWorld.pluginInfo')"
          :description="t('helloWorld.pluginDescription')"
        />
      </div>
    </a-card>
  </div>
</template>

<style scoped>
.hello-world-view {
  padding: 24px;
}

.hello-card {
  max-width: 800px;
  margin: 0 auto;
}

.card-title {
  font-size: 18px;
  font-weight: 500;
}

.card-content {
  padding: 20px 0;
}
</style>
