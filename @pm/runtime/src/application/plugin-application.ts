import type { App } from 'vue';
import type { I18n } from 'vue-i18n';
import type { Router } from 'vue-router';

import type {
  Plugin,
  PluginImpl,
  PluginManagerOptions,
  PluginMeta,
} from '@vben/pm-core';

import { createLogger, PluginManager } from '@vben/pm-core';

import { PluginConfigManager } from '../config/plugin-config';
import { PluginLoader, PluginSourceType } from '../loader/plugin-loader';
import { usePluginStore } from '../store/plugin-store';
import { setupPluginHooks } from './plugin-hooks';

/**
 * Plugin Application Class
 *
 * Main entry point for integrating the plugin system with Vue-Vben-Admin.
 * This class orchestrates all aspects of the plugin system and provides
 * a unified API for the application to interact with plugins.
 */
export class PluginApplication {
  // Vue application instances
  private app: App | null = null;
  private booted = false;
  private configManager: PluginConfigManager;

  private i18n: I18n | null = null;
  // Application state
  private initialized = false;

  private logger: ReturnType<typeof createLogger>;
  private pluginLoader: PluginLoader;
  // Core components
  private pluginManager: PluginManager;

  // Plugin store for state management
  private pluginStore = usePluginStore();
  private router: null | Router = null;

  /**
   * Create a new PluginApplication instance
   *
   * @param options Plugin manager options
   */
  constructor(options: PluginManagerOptions = {}) {
    this.logger = createLogger({
      level: options.logger?.level || 'info',
      prefix: '[PluginApplication]',
    });

    // Initialize core components
    this.pluginManager = new PluginManager(options);
    this.pluginLoader = new PluginLoader();
    this.configManager = new PluginConfigManager();

    this.logger.info('Plugin Application created');
  }

  /**
   * Activate a plugin
   *
   * @param pluginId Plugin ID
   */
  async activatePlugin(pluginId: string): Promise<boolean> {
    if (!this.initialized) {
      throw new Error(
        'Plugin Application must be initialized before activating plugins',
      );
    }

    this.logger.info(`Activating plugin: ${pluginId}`);
    return await this.pluginManager.activate(pluginId);
  }

  /**
   * Add an inline plugin source with plugin definitions
   *
   * @param id Source ID
   * @param plugins Array of plugin definitions [meta, impl]
   * @param options Additional options
   */
  addInlineSource(
    id: string,
    plugins: Array<[PluginMeta, PluginImpl]>,
    options: Record<string, any> = {},
  ): void {
    this.pluginLoader.addInlineSource(id, plugins, options);
  }

  /**
   * Add a local file source using import.meta.glob
   *
   * @param id Source ID
   * @param pattern The glob pattern
   * @param modules The modules from import.meta.glob
   * @param options Additional options
   */
  addLocalFileSource(
    id: string,
    pattern: string,
    modules: Record<string, () => Promise<any>>,
    options: Record<string, any> = {},
  ): void {
    this.pluginLoader.addLocalFileSource(id, pattern, modules, options);
  }

  /**
   * Add a plugin source
   *
   * @param id Source ID
   * @param source Plugin source
   */
  addPluginSource(
    id: string,
    source: { location: string; type: PluginSourceType },
  ): void {
    this.pluginLoader.addSource(id, source);
  }

  /**
   * Boot the plugin system
   * This loads and activates plugins
   */
  async boot(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Plugin Application must be initialized before booting');
    }

    if (this.booted) {
      this.logger.warn('Plugin Application already booted');
      return;
    }

    this.logger.info('Booting Plugin Application');

    try {
      // Load plugins from configured sources
      const pluginResults = await this.pluginLoader.loadAllPlugins();

      // Register loaded plugins
      for (const result of pluginResults) {
        if (result.error) {
          this.logger.error(
            `Failed to load plugin ${result.meta.id}:`,
            result.error,
          );
          continue;
        }

        // Register the plugin
        await this.pluginManager.register(result.meta, result.impl);

        // Apply saved configuration
        const plugin = this.pluginManager.getPlugin(result.meta.id);
        if (plugin) {
          this.configManager.applyConfigToPlugin(plugin);
        }
      }

      // Set up hooks for plugin lifecycle events
      if (this.app && this.router && this.i18n) {
        setupPluginHooks(this.pluginManager, {
          app: this.app,
          i18n: this.i18n,
          router: this.router,
        });
      }

      this.booted = true;
      this.logger.info('Plugin Application booted successfully');
    } catch (error) {
      this.logger.error('Failed to boot Plugin Application', error);
      throw error;
    }
  }

  /**
   * Deactivate a plugin
   *
   * @param pluginId Plugin ID
   */
  async deactivatePlugin(pluginId: string): Promise<boolean> {
    if (!this.initialized) {
      throw new Error(
        'Plugin Application must be initialized before deactivating plugins',
      );
    }

    this.logger.info(`Deactivating plugin: ${pluginId}`);
    return await this.pluginManager.deactivate(pluginId);
  }

  /**
   * Get active plugins
   */
  getActivePlugins(): Plugin[] {
    return this.pluginManager.getActivePlugins();
  }

  /**
   * Get a plugin by ID
   *
   * @param pluginId Plugin ID
   */
  getPlugin(pluginId: string): Plugin | undefined {
    return this.pluginManager.getPlugin(pluginId);
  }

  /**
   * Get plugin configuration
   *
   * @param pluginId Plugin ID
   */
  getPluginConfig<T = Record<string, any>>(pluginId: string): T {
    return this.configManager.getConfig<T>(pluginId);
  }

  /**
   * Get all plugins
   */
  getPlugins(): Plugin[] {
    return this.pluginManager.getPlugins();
  }

  /**
   * Get all plugin sources
   */
  getPluginSources() {
    return this.pluginLoader.getSources();
  }

  /**
   * Initialize the plugin application
   * This associates the plugin system with the Vue application
   *
   * @param app Vue application instance
   * @param router Vue Router instance
   * @param i18n Vue I18n instance
   */
  async initialize(params: {
    app: App;
    i18n: I18n;
    router: Router;
  }): Promise<void> {
    if (this.initialized) {
      this.logger.warn('Plugin Application already initialized');
      return;
    }

    const { app, i18n, router } = params;
    this.app = app;
    this.router = router;
    this.i18n = i18n;

    this.logger.info('Initializing Plugin Application');

    try {
      // Initialize plugin manager
      await this.pluginManager.init({ app, i18n, router });

      // Initialize plugin store
      await this.pluginStore.initializePluginManager(this.pluginManager);

      // Load saved plugin configurations
      await this.configManager.loadConfigs();

      this.initialized = true;
      this.logger.info('Plugin Application initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Plugin Application', error);
      throw error;
    }
  }

  /**
   * Register a plugin directly
   *
   * @param meta Plugin metadata
   * @param impl Plugin implementation
   */
  async registerPlugin(
    meta: PluginMeta,
    impl: PluginImpl,
  ): Promise<null | Plugin> {
    if (!this.initialized) {
      throw new Error(
        'Plugin Application must be initialized before registering plugins',
      );
    }

    this.logger.info(`Registering plugin: ${meta.id}`);
    return await this.pluginManager.register(meta, impl);
  }

  /**
   * Register multiple plugins directly using definePlugin pattern
   *
   * @param plugins Array of plugin definitions [meta, impl]
   * @param sourceId Optional identifier for the source
   */
  async registerPlugins(
    plugins: Array<[PluginMeta, PluginImpl]>,
    sourceId: string = `inline-${Date.now()}`,
  ): Promise<Plugin[]> {
    if (!this.initialized) {
      throw new Error(
        'Plugin Application must be initialized before registering plugins',
      );
    }

    this.logger.info(
      `Registering ${plugins.length} plugins from inline source: ${sourceId}`,
    );

    // Add as inline source
    this.pluginLoader.addInlineSource(sourceId, plugins);

    // Load plugins from this source
    const results = await this.pluginLoader.loadPluginsFromSource({
      id: sourceId,
      location: 'inline',
      plugins,
      type: PluginSourceType.Inline,
    });

    const registeredPlugins: Plugin[] = [];

    // Register each plugin
    for (const result of results) {
      if (result.error) {
        this.logger.error(
          `Failed to load plugin ${result.meta.id}:`,
          result.error,
        );
        continue;
      }

      const plugin = await this.pluginManager.register(
        result.meta,
        result.impl,
      );

      if (plugin) {
        registeredPlugins.push(plugin);

        // Apply default configuration
        this.configManager.applyConfigToPlugin(plugin);
      }
    }

    return registeredPlugins;
  }

  /**
   * Remove a plugin source
   *
   * @param id Source ID
   */
  removePluginSource(id: string): boolean {
    return this.pluginLoader.removeSource(id);
  }

  /**
   * Reset plugin configuration to defaults
   *
   * @param pluginId Plugin ID
   */
  async resetPluginConfig(pluginId: string): Promise<boolean> {
    this.configManager.resetConfig(pluginId);

    // Apply to plugin
    const plugin = this.getPlugin(pluginId);
    if (plugin) {
      this.configManager.applyConfigToPlugin(plugin);
    }

    // Save configurations
    return await this.configManager.saveConfigs();
  }

  /**
   * Set plugin configuration
   *
   * @param pluginId Plugin ID
   * @param config Configuration values
   */
  async setPluginConfig(
    pluginId: string,
    config: Record<string, any>,
  ): Promise<boolean> {
    this.configManager.setConfig(pluginId, config);

    // Apply to plugin
    const plugin = this.getPlugin(pluginId);
    if (plugin) {
      this.configManager.applyConfigToPlugin(plugin);
    }

    // Save configurations
    return await this.configManager.saveConfigs();
  }

  /**
   * Uninstall a plugin
   *
   * @param pluginId Plugin ID
   */
  async uninstallPlugin(pluginId: string): Promise<boolean> {
    if (!this.initialized) {
      throw new Error(
        'Plugin Application must be initialized before uninstalling plugins',
      );
    }

    this.logger.info(`Uninstalling plugin: ${pluginId}`);
    return await this.pluginManager.unregister(pluginId);
  }
}

/**
 * Create and return a plugin application instance
 *
 * @param options Plugin manager options
 */
export function createPluginApplication(
  options: PluginManagerOptions = {},
): PluginApplication {
  return new PluginApplication(options);
}
