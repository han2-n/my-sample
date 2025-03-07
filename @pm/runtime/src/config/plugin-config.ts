import type { Plugin } from '@vben/pm-core';

import { reactive, ref } from 'vue';

import { createLogger } from '@vben/pm-core';

/**
 * Plugin Configuration Manager
 * Manages configuration for all plugins
 */
export class PluginConfigManager {
  // Error state
  public error = ref<Error | null>(null);

  // Loading state
  public loading = ref(false);

  // Configuration values for all plugins
  private configs = reactive<Record<string, Record<string, any>>>({});

  // Default values
  private defaults: Map<string, Record<string, any>> = new Map();

  // Logger
  private logger = createLogger({ level: 'info', prefix: '[PluginConfig]' });

  /**
   * Create a new plugin configuration manager
   */
  constructor() {
    this.logger.info('Plugin Configuration Manager created');
  }

  /**
   * Apply configuration to a plugin
   */
  applyConfigToPlugin(plugin: Plugin): void {
    const config = this.getConfig(plugin.meta.id);
    plugin.meta.settings = { ...plugin.meta.settings, ...config };
    this.logger.info(`Applied configuration to plugin: ${plugin.meta.id}`);
  }

  /**
   * Get configuration values for a plugin
   */
  getConfig<T = Record<string, any>>(pluginId: string): T {
    return (this.configs[pluginId] || {}) as T;
  }

  /**
   * Get a specific configuration value
   */
  getValue<T = any>(pluginId: string, key: string, defaultValue?: T): T {
    const config = this.configs[pluginId];
    return config && config[key] !== undefined
      ? config[key]
      : (defaultValue as T);
  }

  /**
   * Load configurations from persistent storage
   */
  async loadConfigs(): Promise<boolean> {
    try {
      this.loading.value = true;
      this.error.value = null;

      this.logger.info('Loading plugin configurations from storage');

      // In a real implementation, this would load from localStorage, database, etc.
      const savedConfig = localStorage.getItem('plugin_configs');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);

        // Apply saved config
        for (const [pluginId, values] of Object.entries(parsed)) {
          this.configs[pluginId] = values as Record<string, any>;
        }

        this.logger.info(
          `Loaded configurations for ${Object.keys(parsed).length} plugins`,
        );
      } else {
        this.logger.info('No saved plugin configurations found');
      }

      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.error.value = err;
      this.logger.error('Failed to load plugin configurations:', err);
      return false;
    } finally {
      this.loading.value = false;
    }
  }

  /**
   * Reset configuration to defaults
   */
  resetConfig(pluginId: string): void {
    this.logger.info(`Resetting configuration for plugin: ${pluginId}`);
    const defaults = this.defaults.get(pluginId) || {};
    this.setConfig(pluginId, { ...defaults });
  }

  /**
   * Save configurations to persistent storage
   */
  async saveConfigs(): Promise<boolean> {
    try {
      this.loading.value = true;
      this.error.value = null;

      this.logger.info('Saving plugin configurations to storage');

      // In a real implementation, this would save to localStorage, database, etc.
      localStorage.setItem('plugin_configs', JSON.stringify(this.configs));

      this.logger.info('Plugin configurations saved successfully');
      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.error.value = err;
      this.logger.error('Failed to save plugin configurations:', err);
      return false;
    } finally {
      this.loading.value = false;
    }
  }

  /**
   * Set configuration values for a plugin
   */
  setConfig(pluginId: string, values: Record<string, any>): void {
    this.logger.info(`Setting configuration for plugin: ${pluginId}`);

    // Update config
    const oldValues = this.configs[pluginId] || {};
    const newValues = { ...oldValues, ...values };

    // Update config
    this.configs[pluginId] = newValues;
  }

  /**
   * Set default configuration for a plugin
   */
  setDefaults(pluginId: string, defaults: Record<string, any>): void {
    this.defaults.set(pluginId, { ...defaults });

    // Initialize config with defaults if not already set
    if (this.configs[pluginId]) {
      // Apply defaults for missing values
      for (const [key, value] of Object.entries(defaults)) {
        if (this.configs[pluginId][key] === undefined) {
          this.configs[pluginId][key] = value;
        }
      }
    } else {
      this.configs[pluginId] = { ...defaults };
    }

    this.logger.info(`Set default configuration for plugin: ${pluginId}`);
  }

  /**
   * Set a specific configuration value
   */
  setValue(pluginId: string, key: string, value: any): void {
    this.logger.info(
      `Setting configuration value for plugin ${pluginId}: ${key}`,
    );
    const values = { ...this.configs[pluginId], [key]: value };
    this.setConfig(pluginId, values);
  }
}

/**
 * Create a composable for using plugin configuration
 */
export function usePluginConfig() {
  const configManager = new PluginConfigManager();

  return {
    configManager,
    error: configManager.error,
    // Shorthand methods
    getConfig: configManager.getConfig.bind(configManager),

    getValue: configManager.getValue.bind(configManager),
    loading: configManager.loading,
    resetConfig: configManager.resetConfig.bind(configManager),
    setConfig: configManager.setConfig.bind(configManager),
    setValue: configManager.setValue.bind(configManager),
  };
}
