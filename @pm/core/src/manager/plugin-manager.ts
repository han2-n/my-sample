import type { Store } from 'pinia';

import type { App } from 'vue';
import type { I18n } from 'vue-i18n';
import type { Router } from 'vue-router';

import type { PluginContext, PluginHooks } from '../types/context';
import type {
  PluginInstance,
  PluginManifest,
  PluginOptions,
} from '../types/plugin';

import { reactive, ref } from 'vue';

import { createPluginContext } from '../context/plugin-context';
import { createPluginHooks } from '../hooks/create-hooks';
import {
  resolvePluginDependencies,
  sortPluginsByDependencies,
} from '../utils/dependency';
import { createLogger } from '../utils/logger';
import { PluginLoader } from './plugin-loader';

/**
 * Plugin Manager
 * Central class for managing plugins in the application
 */
export class PluginManager {
  public error = ref<Error | null>(null);
  public loading = ref(false);
  // Reactive state for plugins
  public plugins = reactive<Record<string, PluginInstance>>({});
  private app: App | null = null;
  private config: Record<string, any> = {};
  private context: null | PluginContext = null;
  private hooks: PluginHooks;
  private i18n: I18n | null = null;
  private loader: PluginLoader;
  private logger: ReturnType<typeof createLogger>;

  private options: PluginOptions;
  private router: null | Router = null;
  private store: null | Store = null;

  constructor(options: PluginOptions) {
    this.options = {
      autoActivate: true,
      resolveDependencies: true,
      strictDependencies: false,
      ...options,
    };

    this.logger = createLogger({
      level: this.options.logger?.level || 'info',
      prefix: this.options.logger?.prefix || '[Plugin]',
    });

    this.hooks = createPluginHooks();

    this.loader = new PluginLoader({
      logger: this.logger,
      storeDir: options.storeDir,
    });
  }

  /**
   * Activate all enabled plugins
   */
  async activateEnabledPlugins(): Promise<void> {
    try {
      this.logger.info('Activating enabled plugins');

      // Sort plugins by dependencies
      const sortedPlugins = sortPluginsByDependencies(
        this.plugins,
        this.options.strictDependencies,
      );

      // Activate each enabled plugin
      for (const plugin of sortedPlugins) {
        if (plugin.manifest.enabled !== false) {
          await this.activatePlugin(plugin.manifest.id);
        }
      }
    } catch (error) {
      this.logger.error('Failed to activate enabled plugins', error);
      throw error;
    }
  }

  /**
   * Activate a plugin
   */
  async activatePlugin(pluginId: string): Promise<boolean> {
    try {
      const plugin = this.plugins[pluginId];

      if (!plugin) {
        this.logger.error(`Plugin not found: ${pluginId}`);
        return false;
      }

      if (plugin.activated) {
        this.logger.warn(`Plugin already activated: ${pluginId}`);
        return true;
      }

      // Emit before activate event
      this.hooks.beforeActivate(pluginId);

      // Setup the plugin if not already
      if (!plugin.loaded) {
        await this.setupPlugin(pluginId);
      }

      // If dependencies should be resolved
      if (
        this.options.resolveDependencies &&
        plugin.manifest.dependencies?.length
      ) {
        // Activate dependencies first
        const dependencies = resolvePluginDependencies(
          this.plugins,
          plugin,
          this.options.strictDependencies,
        );

        for (const dependency of dependencies) {
          await this.activatePlugin(dependency.manifest.id);
        }
      }

      // If the plugin has an activate function, call it
      if (plugin.activate) {
        await plugin.activate();
      }

      // Mark as activated
      plugin.activated = true;
      plugin.meta.lastActivatedAt = new Date();

      // Save plugin state
      await this.loader.savePluginState(pluginId, {
        activated: true,
        meta: plugin.meta,
      });

      // Emit after activate event
      this.hooks.afterActivate(pluginId);

      this.logger.info(`Plugin activated: ${pluginId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to activate plugin: ${pluginId}`, error);
      return false;
    }
  }

  /**
   * Deactivate a plugin
   */
  async deactivatePlugin(pluginId: string): Promise<boolean> {
    try {
      const plugin = this.plugins[pluginId];

      if (!plugin) {
        this.logger.error(`Plugin not found: ${pluginId}`);
        return false;
      }

      if (!plugin.activated) {
        this.logger.warn(`Plugin not activated: ${pluginId}`);
        return true;
      }

      // Emit before deactivate event
      this.hooks.beforeDeactivate(pluginId);

      // If the plugin has a deactivate function, call it
      if (plugin.deactivate) {
        await plugin.deactivate();
      }

      // Mark as deactivated
      plugin.activated = false;

      // Save plugin state
      await this.loader.savePluginState(pluginId, {
        activated: false,
        meta: plugin.meta,
      });

      // Emit after deactivate event
      this.hooks.afterDeactivate(pluginId);

      this.logger.info(`Plugin deactivated: ${pluginId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to deactivate plugin: ${pluginId}`, error);
      return false;
    }
  }

  /**
   * Discover and load all available plugins
   */
  async discoverAndLoadPlugins(): Promise<void> {
    try {
      this.loading.value = true;
      this.error.value = null;

      // Discover available plugins
      const manifests = await this.loader.discoverPlugins();

      // Load each plugin
      for (const manifest of Object.values(manifests)) {
        await this.loadPlugin(manifest);
      }
    } catch (error) {
      this.logger.error('Failed to discover and load plugins', error);
      this.error.value =
        error instanceof Error ? error : new Error(String(error));
    } finally {
      this.loading.value = false;
    }
  }

  /**
   * Get all activated plugins
   */
  getActivatedPlugins(): PluginInstance[] {
    return Object.values(this.plugins).filter((plugin) => plugin.activated);
  }

  /**
   * Get all plugins
   */
  getAllPlugins(): PluginInstance[] {
    return Object.values(this.plugins);
  }

  /**
   * Get plugin configuration
   */
  getConfig<T>(key: string, defaultValue?: T): T {
    return this.config[key] === undefined
      ? (defaultValue as T)
      : this.config[key];
  }

  /**
   * Get a plugin by ID
   */
  getPlugin(id: string): PluginInstance | undefined {
    return this.plugins[id];
  }

  /**
   * Initialize the plugin manager with the application
   */
  async init(params: {
    app: App;
    i18n: I18n;
    router: Router;
    store: Store;
  }): Promise<void> {
    const { app, i18n, router, store } = params;

    this.app = app;
    this.router = router;
    this.store = store;
    this.i18n = i18n;

    // Create plugin context
    this.context = createPluginContext({
      app,
      config: this.config,
      hooks: this.hooks,
      i18n,
      plugins: this.plugins,
      router,
      store,
    });

    // Discover and load plugins
    await this.discoverAndLoadPlugins();

    // Auto-activate enabled plugins
    if (this.options.autoActivate) {
      await this.activateEnabledPlugins();
    }
  }

  /**
   * Load a specific plugin
   */
  async loadPlugin(manifest: PluginManifest): Promise<null | PluginInstance> {
    try {
      // Check if plugin is already loaded
      if (this.plugins[manifest.id]) {
        this.logger.warn(`Plugin already loaded: ${manifest.id}`);
        return this.plugins[manifest.id];
      }

      // Load the plugin
      const plugin = await this.loader.loadPlugin(manifest);

      // Register the plugin
      this.plugins[manifest.id] = plugin;

      this.logger.info(`Plugin loaded: ${manifest.id}`);
      return plugin;
    } catch (error) {
      this.logger.error(`Failed to load plugin: ${manifest.id}`, error);
      return null;
    }
  }

  /**
   * Set plugin configuration
   */
  setConfig(key: string, value: any): void {
    this.config[key] = value;
  }

  /**
   * Setup a plugin (initialize it)
   */
  async setupPlugin(pluginId: string): Promise<boolean> {
    try {
      const plugin = this.plugins[pluginId];

      if (!plugin) {
        this.logger.error(`Plugin not found: ${pluginId}`);
        return false;
      }

      if (!this.context) {
        this.logger.error('Plugin context not initialized');
        return false;
      }

      // If the plugin has a setup function, call it
      if (plugin.setup) {
        await plugin.setup(this.context);
      }

      return true;
    } catch (error) {
      this.logger.error(`Failed to setup plugin: ${pluginId}`, error);
      return false;
    }
  }

  /**
   * Update a plugin's manifest
   */
  async updatePluginManifest(
    pluginId: string,
    updates: Partial<PluginManifest>,
  ): Promise<boolean> {
    try {
      const plugin = this.plugins[pluginId];

      if (!plugin) {
        this.logger.error(`Plugin not found: ${pluginId}`);
        return false;
      }

      // Update the manifest
      Object.assign(plugin.manifest, updates);

      // Save plugin state
      await this.loader.savePluginState(pluginId, {
        manifest: plugin.manifest,
      });

      return true;
    } catch (error) {
      this.logger.error(`Failed to update plugin manifest: ${pluginId}`, error);
      return false;
    }
  }
}
