import type { Store } from 'pinia';

import type { App, Component } from 'vue';
import type { I18n } from 'vue-i18n';
import type { Router, RouteRecordRaw } from 'vue-router';

import type { PluginInstance } from './plugin';

/**
 * Plugin lifecycle hooks
 */
export interface PluginHooks {
  /** After plugin activation */
  afterActivate: (pluginId: string) => void;

  /** After plugin deactivation */
  afterDeactivate: (pluginId: string) => void;

  /** Before plugin activation */
  beforeActivate: (pluginId: string) => void;

  /** Before plugin deactivation */
  beforeDeactivate: (pluginId: string) => void;

  /** When a plugin registers a component */
  onComponentRegistered: (pluginId: string, componentName: string) => void;

  /** When a plugin registers a menu item */
  onMenuItemRegistered: (pluginId: string, menuItem: any) => void;

  /** When a plugin registers a route */
  onRouteRegistered: (pluginId: string, route: RouteRecordRaw) => void;
}

/**
 * Plugin context provided to each plugin
 */
export interface PluginContext {
  /** Vue application instance */
  app: App;

  /** Get configuration value */
  getConfig: <T>(key: string, defaultValue?: T) => T;

  /** Get plugin by ID */
  getPlugin: (id: string) => PluginInstance | undefined;

  /** Plugin lifecycle hooks */
  hooks: PluginHooks;

  /** i18n instance */
  i18n: I18n;

  /** Log a message from the plugin */
  log: (
    level: 'debug' | 'error' | 'info' | 'warn',
    message: string,
    ...args: any[]
  ) => void;

  /** Register a component */
  registerComponent: (name: string, component: Component) => void;

  /** Register localization messages */
  registerLocale: (locale: string, messages: Record<string, any>) => void;

  /** Register a menu item */
  registerMenuItem: (menuItem: any) => void;

  /** Register a permission */
  registerPermission: (permission: string, description?: string) => void;

  /** Register a route */
  registerRoute: (route: RouteRecordRaw) => void;

  /** Register a store module */
  registerStore: (namespace: string, storeModule: any) => void;

  /** Router instance */
  router: Router;

  /** Set configuration value */
  setConfig: <T>(key: string, value: T) => void;

  /** Pinia store instance */
  store: Store;
}
