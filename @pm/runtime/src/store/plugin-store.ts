import type { Plugin, PluginImpl, PluginMeta } from '@vben/pm-core';

import { computed, ref } from 'vue';

import { PluginManager } from '@vben/pm-core';

import { defineStore } from 'pinia';

/**
 * Pinia store for managing plugins
 * This provides a reactive interface to the plugin system
 */
export const usePluginStore = defineStore('plugin', () => {
  // State
  const pluginManager = ref<null | PluginManager>(null);
  const initialized = ref(false);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  // Getters
  const isInitialized = computed(() => initialized.value);
  const isLoading = computed(() => loading.value);
  const errorMessage = computed(() => error.value?.message || '');

  const allPlugins = computed(() => {
    return pluginManager.value?.getPlugins() || [];
  });

  const activePlugins = computed(() => {
    return pluginManager.value?.getActivePlugins() || [];
  });

  // Actions
  async function initializePluginManager(
    manager: PluginManager,
  ): Promise<void> {
    pluginManager.value = manager;
    initialized.value = true;
  }

  async function registerPlugin(
    meta: PluginMeta,
    impl: PluginImpl,
  ): Promise<null | Plugin> {
    if (!pluginManager.value) {
      throw new Error('Plugin manager not initialized');
    }

    try {
      loading.value = true;
      error.value = null;

      return await pluginManager.value.register(meta, impl);
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

      return await pluginManager.value.activate(pluginId);
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

      return await pluginManager.value.deactivate(pluginId);
    } catch (error_) {
      error.value =
        error_ instanceof Error ? error_ : new Error(String(error_));
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function unregisterPlugin(pluginId: string): Promise<boolean> {
    if (!pluginManager.value) {
      throw new Error('Plugin manager not initialized');
    }

    try {
      loading.value = true;
      error.value = null;

      return await pluginManager.value.unregister(pluginId);
    } catch (error_) {
      error.value =
        error_ instanceof Error ? error_ : new Error(String(error_));
      return false;
    } finally {
      loading.value = false;
    }
  }

  function getPlugin(pluginId: string): Plugin | undefined {
    if (!pluginManager.value) {
      return undefined;
    }

    return pluginManager.value.getPlugin(pluginId);
  }

  async function updatePluginMeta(
    pluginId: string,
    updates: Partial<PluginMeta>,
  ): Promise<boolean> {
    if (!pluginManager.value) {
      throw new Error('Plugin manager not initialized');
    }

    try {
      loading.value = true;
      error.value = null;

      return await pluginManager.value.updatePluginMeta(pluginId, updates);
    } catch (error_) {
      error.value =
        error_ instanceof Error ? error_ : new Error(String(error_));
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    activatePlugin,
    activePlugins,
    allPlugins,
    deactivatePlugin,

    error,
    errorMessage,
    getPlugin,
    initialized,
    // Actions
    initializePluginManager,

    // Getters
    isInitialized,
    isLoading,
    loading,
    // State
    pluginManager,
    registerPlugin,
    unregisterPlugin,
    updatePluginMeta,
  };
});
