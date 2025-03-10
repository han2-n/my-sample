import type { App, Component, UnwrapRef } from 'vue';
import type { I18n } from 'vue-i18n';
import type { Router, RouteRecordRaw } from 'vue-router';

import type {
  PluginContext,
  PluginHooks,
  StateChangeListener,
} from '../types/context';
import type { Plugin } from '../types/plugin';

import { createLogger } from '../utils/logger';
import { PluginStateRegistry } from '../utils/state-registry';

/**
 * Create a plugin context
 *
 * The plugin context is provided to each plugin's setup function
 * and contains utilities for interacting with the application.
 */
export function createPluginContext(options: {
  app: App;
  config: Record<string, any>;
  hooks: PluginHooks;
  i18n: I18n;
  plugins: Record<string, Plugin>;
  router: Router;
  stateRegistry: PluginStateRegistry;
}): PluginContext {
  const { app, config, hooks, i18n, plugins, router, stateRegistry } = options;
  const logger = createLogger({ level: 'info', prefix: '[Plugin]' });

  /**
   * Get the ID of the calling plugin
   * This is used to track which plugin registered what
   */
  const getCallerPluginId = (): null | string => {
    // This is a simplified implementation
    // In a real implementation, we would need a more robust way to track
    // which plugin is calling the context methods

    // For now, we'll just return null
    return null;
  };

  // Create and return the context object
  const context: PluginContext = {
    // Application instances
    app,
    // Configuration methods
    getConfig<T = any>(key: string, defaultValue?: T): T {
      return config[key] === undefined ? (defaultValue as T) : config[key];
    },
    // Plugin access methods
    getPlugin(id: string) {
      return plugins[id];
    },
    getPlugins() {
      return Object.values(plugins);
    },

    getPluginState<T = any>(
      pluginId: string,
      namespace: string,
    ): undefined | UnwrapRef<T> {
      return stateRegistry.getState<T>(pluginId, namespace);
    },

    hasPluginState(pluginId: string, namespace: string): boolean {
      return stateRegistry.hasState(pluginId, namespace);
    },

    hooks,

    i18n,

    // Logging method
    log(
      level: 'debug' | 'error' | 'info' | 'warn',
      message: string,
      ...args: any[]
    ) {
      const pluginId = getCallerPluginId();
      const prefix = pluginId ? `[Plugin:${pluginId}]` : '[Plugin]';

      switch (level) {
        case 'debug': {
          logger.debug(`${prefix} ${message}`, ...args);
          break;
        }
        case 'error': {
          logger.error(`${prefix} ${message}`, ...args);
          break;
        }
        case 'info': {
          logger.info(`${prefix} ${message}`, ...args);
          break;
        }
        case 'warn': {
          logger.warn(`${prefix} ${message}`, ...args);
          break;
        }
      }
    },

    // Registration methods
    registerComponent(name: string, component: Component) {
      // Register with Vue
      app.component(name, component);

      // Get plugin ID
      const pluginId = getCallerPluginId();

      // Store with plugin
      if (pluginId && plugins[pluginId]) {
        if (!plugins[pluginId].components) {
          plugins[pluginId].components = {};
        }
        plugins[pluginId].components[name] = component;
      }

      // Emit hook event
      if (pluginId) {
        hooks.componentRegistered(pluginId, name, component);
      }
    },

    registerLocale(locale: string, messages: Record<string, any>) {
      // Add to i18n
      i18n.global.mergeLocaleMessage(locale, messages);
    },

    registerPermission(permission: string, description?: string) {
      // This would depend on how vue-vben-admin handles permissions
      logger.info(`Registered permission: ${permission}`, { description });
    },

    registerRoute(route: RouteRecordRaw) {
      // Add to router
      router.addRoute(route);

      // Get plugin ID
      const pluginId = getCallerPluginId();

      // Store with plugin
      if (pluginId && plugins[pluginId]) {
        if (!plugins[pluginId].routes) {
          plugins[pluginId].routes = [];
        }
        plugins[pluginId].routes.push(route);
      }

      // Emit hook event
      if (pluginId) {
        hooks.routeRegistered(pluginId, route);
      }
    },

    // State sharing methods
    registerState<T extends object>(
      namespace: string,
      initialState: T,
    ): UnwrapRef<T> {
      const pluginId = getCallerPluginId();
      if (!pluginId) {
        throw new Error('Cannot register state: Plugin ID not available');
      }

      const state = stateRegistry.registerState(
        pluginId,
        namespace,
        initialState,
      );

      // Emit hook event
      hooks.stateRegistered(pluginId, namespace);

      return state;
    },

    registerStore(namespace: string, store: any) {
      // This would depend on how vue-vben-admin manages store modules
      logger.info(`Registered store module: ${namespace}`);
    },

    router,

    setConfig<T = any>(key: string, value: T): void {
      config[key] = value;
    },

    subscribeToState<T = any>(
      pluginId: string,
      namespace: string,
      listener: StateChangeListener<T>,
    ): () => void {
      return stateRegistry.subscribeToState(pluginId, namespace, listener);
    },
  };

  return context;
}
