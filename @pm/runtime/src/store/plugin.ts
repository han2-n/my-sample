import type { PluginInstance, PluginManifest } from '@vben/pm-core';

import { computed, ref } from 'vue';

import { PluginManager } from '@vben/pm-core';

// packages/@pm/runtime/src/store/plugin.ts
import { defineStore } from 'pinia';

export const usePluginStore = defineStore('plugin', () => {
  // State
  const pluginManager = ref<null | PluginManager>(null);
  const initialized = ref(false);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  // Getters
  const isInitialized = computed(() => initialized.value);
  const isLoading = computed(() => loading.value);
  const hasError = computed(() => error.value !== null);
  const errorMessage = computed(() => error.value?.message || '');

  const allPlugins = computed(() => {
    return pluginManager.value?.getAllPlugins() || [];
  });

  const activePlugins = computed(() => {
    return pluginManager.value?.getActivatedPlugins() || [];
  });

  // Actions
  async function initializePluginManager(
    manager: PluginManager,
  ): Promise<void> {
    pluginManager.value = manager;
    initialized.value = true;
  }

  async function loadPlugin(
    manifest: PluginManifest,
  ): Promise<null | PluginInstance> {
    if (!pluginManager.value) {
      throw new Error('Plugin manager not initialized');
    }

    try {
      loading.value = true;
      error.value = null;

      const plugin = await pluginManager.value.loadPlugin(manifest);
      return plugin;
    } catch (error_) {
      error.value =
        error_ instanceof Error ? error_ : new Error(String(error_));
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function activatePlugin(pluginId: string): Promise<boolean> {
    if (!pluginManager.value) {
      throw new Error('Plugin manager not initialized');
    }

    try {
      loading.value = true;
      error.value = null;

      const success = await pluginManager.value.activatePlugin(pluginId);
      return success;
    } catch (error_) {
      error.value =
        error_ instanceof Error ? error_ : new Error(String(error_));
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function deactivatePlugin(pluginId: string): Promise<boolean> {
    if (!pluginManager.value) {
      throw new Error('Plugin manager not initialized');
    }

    try {
      loading.value = true;
      error.value = null;

      const success = await pluginManager.value.deactivatePlugin(pluginId);
      return success;
    } catch (error_) {
      error.value =
        error_ instanceof Error ? error_ : new Error(String(error_));
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function updatePluginManifest(
    pluginId: string,
    updates: Partial<PluginManifest>,
  ): Promise<boolean> {
    if (!pluginManager.value) {
      throw new Error('Plugin manager not initialized');
    }

    try {
      loading.value = true;
      error.value = null;

      const success = await pluginManager.value.updatePluginManifest(
        pluginId,
        updates,
      );
      return success;
    } catch (error_) {
      error.value =
        error_ instanceof Error ? error_ : new Error(String(error_));
      return false;
    } finally {
      loading.value = false;
    }
  }

  function getPlugin(pluginId: string): PluginInstance | undefined {
    if (!pluginManager.value) {
      return undefined;
    }

    return pluginManager.value.getPlugin(pluginId);
  }

  return {
    activatePlugin,
    activePlugins,
    allPlugins,
    deactivatePlugin,

    error,
    errorMessage,
    getPlugin,
    hasError,
    initialized,
    // Actions
    initializePluginManager,

    // Getters
    isInitialized,
    isLoading,
    loading,
    loadPlugin,
    // State
    pluginManager,
    updatePluginManifest,
  };
});
