import type { App } from 'vue';
import type { I18n } from 'vue-i18n';
import type { Router } from 'vue-router';

import type { PluginContext, PluginHooks } from '../types/context';
import type {
  Plugin,
  PluginImpl,
  PluginManagerOptions,
  PluginMeta,
} from '../types/plugin';

import { reactive, ref } from 'vue';

import { createPluginHooks } from '../hooks/create-hooks';
import { sortPluginsByDependencies } from '../utils/dependency';
import { createLogger } from '../utils/logger';
import { createPluginContext } from './plugin-context';

/**
 * Plugin Manager
 *
 * Manages the registration, loading, activation, and deactivation of plugins.
 */
export class PluginManager {
  /**
   * Error state
   */
  public error = ref<Error | null>(null);

  /**
   * Loading state
   */
  public loading = ref(false);

  /**
   * Registered plugins
   * This is a reactive object so Vue components can react to changes
   */
  public plugins = reactive<Record<string, Plugin>>({});

  // Internal state
  private app: App | null = null;
  private config: Record<string, any> = {};
  private context: null | PluginContext = null;
  private hooks: PluginHooks;
  private i18n: I18n | null = null;
  private logger: ReturnType<typeof createLogger>;
  private options: Required<PluginManagerOptions>;
  private router: null | Router = null;

  /**
   * Create a new PluginManager
   */
  constructor(options: PluginManagerOptions = {}) {
    // Set default options
    this.options = {
      autoActivate: true,
      resolveDependencies: true,
      strictDependencies: false,
      ...options,
      logger: {
        level: options.logger?.level || 'info',
        prefix: options.logger?.prefix || '[PluginManager]',
      },
    };

    this.logger = createLogger(this.options.logger);
    this.hooks = createPluginHooks();
  }

  /**
   * Activate a plugin
   */
  async activate(pluginId: string): Promise<boolean> {
    try {
      const plugin = this.plugins[pluginId];

      if (!plugin) {
        this.logger.error(`Plugin not found: ${pluginId}`);
        return false;
      }

      if (plugin.status.active) {
        this.logger.warn(`Plugin already activated: ${pluginId}`);
        return true;
      }

      if (!this.context) {
        this.logger.error('Plugin context not initialized');
        return false;
      }

      // Emit before activate event
      this.hooks.beforePluginActivate(pluginId);

      // Setup the plugin if not already loaded
      if (!plugin.status.loaded && plugin.impl.setup) {
        this.logger.info(`Setting up plugin: ${pluginId}`);

        // Emit before setup event
        this.hooks.beforePluginSetup(pluginId);

        // Call setup function
        await plugin.impl.setup(this.context);

        // Mark as loaded
        plugin.status.loaded = true;

        // Emit after setup event
        this.hooks.afterPluginSetup(pluginId);
      }

      // Resolve dependencies if needed
      if (
        this.options.resolveDependencies &&
        plugin.meta.dependencies?.length
      ) {
        for (const depId of plugin.meta.dependencies) {
          const dependency = this.plugins[depId];

          if (!dependency) {
            if (this.options.strictDependencies) {
              throw new Error(
                `Missing dependency: ${depId} required by ${pluginId}`,
              );
            } else {
              this.logger.warn(
                `Missing dependency: ${depId} required by ${pluginId}`,
              );
              continue;
            }
          }

          if (!dependency.status.active) {
            await this.activate(depId);
          }
        }
      }

      // Activate the plugin
      if (plugin.impl.activate) {
        this.logger.info(`Activating plugin: ${pluginId}`);
        await plugin.impl.activate();
      }

      // Update status
      plugin.status.active = true;
      plugin.status.activatedAt = new Date();

      // Emit after activate event
      this.hooks.afterPluginActivate(pluginId);

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
  async deactivate(pluginId: string): Promise<boolean> {
    try {
      const plugin = this.plugins[pluginId];

      if (!plugin) {
        this.logger.error(`Plugin not found: ${pluginId}`);
        return false;
      }

      if (!plugin.status.active) {
        this.logger.warn(`Plugin not activated: ${pluginId}`);
        return true;
      }

      // Emit before deactivate event
      this.hooks.beforePluginDeactivate(pluginId);

      // Check for plugins that depend on this one
      if (this.options.strictDependencies) {
        const dependents = this.findPluginDependents(pluginId);
        if (dependents.length > 0) {
          const dependentIds = dependents.map((p) => p.meta.id).join(', ');
          throw new Error(
            `Cannot deactivate plugin ${pluginId} because it is required by: ${dependentIds}`,
          );
        }
      }

      // Deactivate the plugin
      if (plugin.impl.deactivate) {
        this.logger.info(`Deactivating plugin: ${pluginId}`);
        await plugin.impl.deactivate();
      }

      // Update status
      plugin.status.active = false;

      // Emit after deactivate event
      this.hooks.afterPluginDeactivate(pluginId);

      this.logger.info(`Plugin deactivated: ${pluginId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to deactivate plugin: ${pluginId}`, error);
      return false;
    }
  }

  /**
   * Get active plugins
   */
  getActivePlugins(): Plugin[] {
    return Object.values(this.plugins).filter((plugin) => plugin.status.active);
  }

  /**
   * Get a plugin by ID
   */
  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins[pluginId];
  }

  /**
   * Get all registered plugins
   */
  getPlugins(): Plugin[] {
    return Object.values(this.plugins);
  }

  /**
   * Initialize the plugin manager with application instances
   */
  async init(params: { app: App; i18n: I18n; router: Router }): Promise<void> {
    const { app, i18n, router } = params;

    this.app = app;
    this.router = router;
    this.i18n = i18n;

    // Create plugin context
    this.context = createPluginContext({
      app,
      config: this.config,
      hooks: this.hooks,
      i18n,
      plugins: this.plugins,
      router,
    });

    this.logger.info('Plugin manager initialized');
  }

  /**
   * Register a plugin
   *
   * @param meta Plugin metadata
   * @param impl Plugin implementation
   */
  async register(meta: PluginMeta, impl: PluginImpl): Promise<null | Plugin> {
    try {
      this.loading.value = true;
      this.error.value = null;

      // Check if plugin is already registered
      if (this.plugins[meta.id]) {
        this.logger.warn(`Plugin already registered: ${meta.id}`);
        return this.plugins[meta.id];
      }

      // Create plugin instance
      const plugin: Plugin = {
        impl,
        meta,
        status: {
          active: false,
          installedAt: new Date(),
          loaded: false,
        },
      };

      // Store the plugin
      this.plugins[meta.id] = plugin;

      // Auto-activate if enabled
      if (this.options.autoActivate && meta.enabled !== false) {
        await this.activate(meta.id);
      }

      this.logger.info(`Plugin registered: ${meta.id}`);
      return plugin;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.error.value = err;
      this.logger.error(`Failed to register plugin: ${meta.id}`, err);
      return null;
    } finally {
      this.loading.value = false;
    }
  }

  /**
   * Register multiple plugins
   */
  async registerMany(
    plugins: Array<[PluginMeta, PluginImpl]>,
  ): Promise<Plugin[]> {
    const results: Plugin[] = [];

    // Register each plugin
    for (const [meta, impl] of plugins) {
      const plugin = await this.register(meta, impl);
      if (plugin) {
        results.push(plugin);
      }
    }

    // If dependency resolution is enabled, sort and activate in the correct order
    if (this.options.resolveDependencies && results.length > 0) {
      const sortedPlugins = sortPluginsByDependencies(
        this.plugins,
        this.options.strictDependencies,
      );

      // If auto-activate is enabled, reactivate in the correct order
      if (this.options.autoActivate) {
        // First deactivate all plugins
        for (const plugin of results) {
          if (plugin.status.active) {
            await this.deactivate(plugin.meta.id);
          }
        }

        // Then activate in dependency order
        for (const plugin of sortedPlugins) {
          if (plugin.meta.enabled !== false) {
            await this.activate(plugin.meta.id);
          }
        }
      }
    }

    return results;
  }

  /**
   * Unregister a plugin
   */
  async unregister(pluginId: string): Promise<boolean> {
    try {
      const plugin = this.plugins[pluginId];

      if (!plugin) {
        this.logger.error(`Plugin not found: ${pluginId}`);
        return false;
      }

      // Deactivate if active
      if (plugin.status.active) {
        const success = await this.deactivate(pluginId);
        if (!success) {
          return false;
        }
      }

      // Remove from registry
      delete this.plugins[pluginId];

      this.logger.info(`Plugin unregistered: ${pluginId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to unregister plugin: ${pluginId}`, error);
      return false;
    }
  }

  /**
   * Update a plugin's metadata
   */
  async updatePluginMeta(
    pluginId: string,
    updates: Partial<PluginMeta>,
  ): Promise<boolean> {
    try {
      const plugin = this.plugins[pluginId];

      if (!plugin) {
        this.logger.error(`Plugin not found: ${pluginId}`);
        return false;
      }

      // Update the metadata
      Object.assign(plugin.meta, updates);

      // If enabled state changed, activate or deactivate
      if (
        updates.enabled !== undefined &&
        updates.enabled !== plugin.status.active
      ) {
        await (updates.enabled
          ? this.activate(pluginId)
          : this.deactivate(pluginId));
      }

      this.logger.info(`Plugin metadata updated: ${pluginId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to update plugin metadata: ${pluginId}`, error);
      return false;
    }
  }

  /**
   * Get plugins that depend on a plugin
   */
  private findPluginDependents(pluginId: string): Plugin[] {
    return Object.values(this.plugins).filter((plugin) =>
      plugin.meta.dependencies?.includes(pluginId),
    );
  }
}
