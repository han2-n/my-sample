import type { Store } from 'pinia';

import type { App, Component } from 'vue';
import type { I18n } from 'vue-i18n';
import type { Router, RouteRecordRaw } from 'vue-router';

import type { PluginContext, PluginHooks } from '../types/context';
import type { PluginInstance } from '../types/plugin';

import { createLogger } from '../utils/logger';

/**
 * Create a plugin context
 * This provides the API that plugins will use to interact with the application
 */
export function createPluginContext(params: {
  app: App;
  config: Record<string, any>;
  hooks: PluginHooks;
  i18n: I18n;
  plugins: Record<string, PluginInstance>;
  router: Router;
  store: Store;
}): PluginContext {
  const { app, config, hooks, i18n, plugins, router, store } = params;
  const logger = createLogger({ level: 'info' });

  // Create the context object
  const context: PluginContext = {
    app,
    // Get configuration value
    getConfig<T>(key: string, defaultValue?: T): T {
      return config[key] === undefined ? (defaultValue as T) : config[key];
    },
    // Get a plugin by ID
    getPlugin(id: string) {
      return plugins[id];
    },
    hooks,
    i18n,

    // Log from a plugin
    log(
      level: 'debug' | 'error' | 'info' | 'warn',
      message: string,
      ...args: any[]
    ) {
      const callerPlugin = getCallerPluginId();
      const pluginPrefix = callerPlugin
        ? `[Plugin:${callerPlugin}]`
        : '[Plugin]';

      switch (level) {
        case 'debug': {
          logger.debug(`${pluginPrefix} ${message}`, ...args);
          break;
        }
        case 'error': {
          logger.error(`${pluginPrefix} ${message}`, ...args);
          break;
        }
        case 'info': {
          logger.info(`${pluginPrefix} ${message}`, ...args);
          break;
        }
        case 'warn': {
          logger.warn(`${pluginPrefix} ${message}`, ...args);
          break;
        }
      }
    },

    // Register a component
    registerComponent(name: string, component: Component) {
      app.component(name, component);

      // Update the calling plugin's components
      const callerPlugin = getCallerPluginId();
      if (callerPlugin && plugins[callerPlugin]) {
        if (!plugins[callerPlugin].components) {
          plugins[callerPlugin].components = {};
        }
        plugins[callerPlugin].components[name] = component;
      }

      // Emit component registered event
      if (callerPlugin) {
        hooks.onComponentRegistered(callerPlugin, name);
      }
    },

    // Register localization messages
    registerLocale(locale: string, messages: Record<string, any>) {
      i18n.global.mergeLocaleMessage(locale, messages);
    },

    // Register a menu item
    registerMenuItem(menuItem: any) {
      // Update the calling plugin's menu items
      const callerPlugin = getCallerPluginId();
      if (callerPlugin && plugins[callerPlugin]) {
        if (!plugins[callerPlugin].menuItems) {
          plugins[callerPlugin].menuItems = [];
        }
        plugins[callerPlugin].menuItems.push(menuItem);
      }

      // Emit menu item registered event
      if (callerPlugin) {
        hooks.onMenuItemRegistered(callerPlugin, menuItem);
      }
    },

    // Register a permission
    registerPermission(permission: string, description?: string) {
      // This would depend on how vue-vben-admin handles permissions
      // For now, log that a permission was registered
      logger.info(`Registered permission: ${permission}`, { description });
    },

    // Register a route
    registerRoute(route: RouteRecordRaw) {
      // Find the root route to attach this route to
      const rootRoute = router.getRoutes().find((r) => r.path === '/');

      if (rootRoute && rootRoute.children) {
        router.addRoute(route);

        // Update the calling plugin's routes
        const callerPlugin = getCallerPluginId();
        if (callerPlugin && plugins[callerPlugin]) {
          if (!plugins[callerPlugin].routes) {
            plugins[callerPlugin].routes = [];
          }
          plugins[callerPlugin].routes.push(route);
        }

        // Emit route registered event
        if (callerPlugin) {
          hooks.onRouteRegistered(callerPlugin, route);
        }
      } else {
        logger.error('Root route not found');
      }
    },

    // Register a store module
    registerStore(namespace: string, storeModule: any) {
      // This would depend on how vue-vben-admin manages store modules
      // For now, use a simple implementation
      store[namespace] = storeModule;
    },

    router,

    // Set configuration value
    setConfig<T>(key: string, value: T): void {
      config[key] = value;
    },

    store,
  };

  return context;
}

/**
 * Get the ID of the plugin that is calling the context method
 * This is a simple implementation based on the call stack
 */
function getCallerPluginId(): null | string {
  // This is a simplified implementation
  // In a real implementation, we might use more sophisticated techniques
  // to determine which plugin is calling the context methods

  // For now, we'll assume the plugin ID is passed explicitly
  return null;
}
