// @pm/runtime/src/config/plugin-config.ts

import type { Plugin } from '@vben/pm-core';

import { reactive, ref } from 'vue';

import { createLogger } from '@vben/pm-core';

/**
 * Plugin Configuration Field
 * Represents a configuration field for a plugin
 */
export interface PluginConfigField {
  // Whether the field is advanced (can be hidden in simple view)
  advanced?: boolean;

  // Default value
  defaultValue?: any;

  // Description
  description?: string;

  // Field identifier
  key: string;

  // Display name
  label: string;

  // Options for select/multiselect
  options?: Array<{
    label: string;
    value: any;
  }>;

  // Validation rules
  rules?: Array<{
    message: string;
    type: 'custom' | 'max' | 'min' | 'pattern' | 'required';
    validator?: (value: any) => boolean;
    value?: any;
  }>;

  // Field type
  type:
    | 'array'
    | 'boolean'
    | 'multiselect'
    | 'number'
    | 'object'
    | 'select'
    | 'string';

  // Visibility condition
  visible?: (values: Record<string, any>) => boolean;
}

/**
 * Plugin Configuration Schema
 * Defines the configuration options for a plugin
 */
export interface PluginConfigSchema {
  fields: PluginConfigField[];

  // Optional sections for organizing fields
  sections?: Array<{
    description?: string;
    fields: string[]; // References to field keys
    key: string;
    title: string;
  }>;
}

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
  // History for undo/redo
  private history: Map<string, Array<Record<string, any>>> = new Map();

  private historyIndex: Map<string, number> = new Map();

  // Logger
  private logger = createLogger({ level: 'info', prefix: '[PluginConfig]' });

  // Schemas for all registered plugins
  private schemas: Map<string, PluginConfigSchema> = new Map();

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
   * Get all configuration schemas
   */
  getAllSchemas(): Map<string, PluginConfigSchema> {
    return this.schemas;
  }

  /**
   * Get configuration values for a plugin
   */
  getConfig<T = Record<string, any>>(pluginId: string): T {
    return (this.configs[pluginId] || {}) as T;
  }

  /**
   * Get a configuration schema for a plugin
   */
  getSchema(pluginId: string): PluginConfigSchema | undefined {
    return this.schemas.get(pluginId);
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

          // Initialize history
          if (!this.history.has(pluginId)) {
            this.history.set(pluginId, [
              { ...(values as Record<string, any>) },
            ]);
            this.historyIndex.set(pluginId, 0);
          }
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
   * Redo a previously undone configuration change
   */
  redo(pluginId: string): boolean {
    const history = this.history.get(pluginId) || [];
    const index = this.historyIndex.get(pluginId) || 0;

    if (index < history.length - 1) {
      const newIndex = index + 1;
      this.historyIndex.set(pluginId, newIndex);
      this.configs[pluginId] = { ...history[newIndex] };
      this.logger.info(`Redid configuration change for plugin: ${pluginId}`);
      return true;
    }

    this.logger.warn(
      `No configuration changes to redo for plugin: ${pluginId}`,
    );
    return false;
  }

  /**
   * Register a configuration schema for a plugin
   */
  registerSchema(pluginId: string, schema: PluginConfigSchema): void {
    this.schemas.set(pluginId, schema);
    this.logger.info(`Registered configuration schema for plugin: ${pluginId}`);

    // Initialize defaults
    const defaults: Record<string, any> = {};
    for (const field of schema.fields) {
      if (field.defaultValue !== undefined) {
        defaults[field.key] = field.defaultValue;
      }
    }

    this.defaults.set(pluginId, defaults);

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

    // Initialize history
    if (!this.history.has(pluginId)) {
      this.history.set(pluginId, [{ ...this.configs[pluginId] }]);
      this.historyIndex.set(pluginId, 0);
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

    // Validate values against schema
    const schema = this.schemas.get(pluginId);
    if (schema) {
      this.validateConfig(schema, values);
    }

    // Update config
    const oldValues = this.configs[pluginId] || {};
    const newValues = { ...oldValues, ...values };

    // Add to history
    this.addToHistory(pluginId, newValues);

    // Update config
    this.configs[pluginId] = newValues;
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

  /**
   * Undo the last configuration change
   */
  undo(pluginId: string): boolean {
    const history = this.history.get(pluginId) || [];
    const index = this.historyIndex.get(pluginId) || 0;

    if (index > 0) {
      const newIndex = index - 1;
      this.historyIndex.set(pluginId, newIndex);
      this.configs[pluginId] = { ...history[newIndex] };
      this.logger.info(`Undid configuration change for plugin: ${pluginId}`);
      return true;
    }

    this.logger.warn(
      `No configuration changes to undo for plugin: ${pluginId}`,
    );
    return false;
  }

  /**
   * Add configuration to history
   */
  private addToHistory(pluginId: string, values: Record<string, any>): void {
    const history = this.history.get(pluginId) || [];
    const index = this.historyIndex.get(pluginId) || 0;

    // Remove future history if we're not at the end
    if (index < history.length - 1) {
      history.splice(index + 1);
    }

    // Add new entry
    history.push({ ...values });

    // Update index
    this.historyIndex.set(pluginId, history.length - 1);

    // Limit history size
    if (history.length > 50) {
      history.shift();
      this.historyIndex.set(pluginId, history.length - 1);
    }

    // Update history
    this.history.set(pluginId, history);
  }

  /**
   * Validate configuration values against schema
   */
  private validateConfig(
    schema: PluginConfigSchema,
    values: Record<string, any>,
  ): void {
    for (const field of schema.fields) {
      const value = values[field.key];

      // Skip if value is not present
      if (value === undefined) {
        continue;
      }

      // Validate rules
      if (field.rules) {
        for (const rule of field.rules) {
          switch (rule.type) {
            case 'custom': {
              if (rule.validator && !rule.validator(value)) {
                throw new Error(rule.message);
              }
              break;
            }

            case 'max': {
              if (typeof value === 'number' && value > rule.value) {
                throw new Error(
                  `Field ${field.label} must be at most ${rule.value}`,
                );
              } else if (
                typeof value === 'string' &&
                value.length > rule.value
              ) {
                throw new Error(
                  `Field ${field.label} must be at most ${rule.value} characters`,
                );
              }
              break;
            }

            case 'min': {
              if (typeof value === 'number' && value < rule.value) {
                throw new Error(
                  `Field ${field.label} must be at least ${rule.value}`,
                );
              } else if (
                typeof value === 'string' &&
                value.length < rule.value
              ) {
                throw new Error(
                  `Field ${field.label} must be at least ${rule.value} characters`,
                );
              }
              break;
            }

            case 'pattern': {
              if (
                typeof value === 'string' &&
                !new RegExp(rule.value).test(value)
              ) {
                throw new Error(
                  `Field ${field.label} does not match the required pattern`,
                );
              }
              break;
            }

            case 'required': {
              if (value === undefined || value === null || value === '') {
                throw new Error(`Field ${field.label} is required`);
              }
              break;
            }
          }
        }
      }
    }
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
    // State
    loading: configManager.loading,
    resetConfig: configManager.resetConfig.bind(configManager),

    setConfig: configManager.setConfig.bind(configManager),
    setValue: configManager.setValue.bind(configManager),
  };
}
