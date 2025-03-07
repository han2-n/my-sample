import type { App, Component } from 'vue';
import type { I18n } from 'vue-i18n';
import type { Router, RouteRecordRaw } from 'vue-router';

import type { Plugin } from './plugin';

/**
 * Plugin hook event names
 */
export type PluginHookEvent =
  | 'afterPluginActivate'
  | 'afterPluginDeactivate'
  | 'afterPluginSetup'
  | 'beforePluginActivate'
  | 'beforePluginDeactivate'
  | 'beforePluginSetup'
  | 'componentRegistered'
  | 'menuItemRegistered'
  | 'routeRegistered';

/**
 * Plugin hooks interface
 */
export interface PluginHooks {
  /**
   * After plugin activation
   */
  afterPluginActivate: (pluginId: string) => void;

  /**
   * After plugin deactivation
   */
  afterPluginDeactivate: (pluginId: string) => void;

  /**
   * After plugin setup
   */
  afterPluginSetup: (pluginId: string) => void;

  /**
   * Before plugin activation
   */
  beforePluginActivate: (pluginId: string) => void;

  /**
   * Before plugin deactivation
   */
  beforePluginDeactivate: (pluginId: string) => void;

  /**
   * Before plugin setup
   */
  beforePluginSetup: (pluginId: string) => void;

  /**
   * When a component is registered
   */
  componentRegistered: (
    pluginId: string,
    name: string,
    component: Component,
  ) => void;

  /**
   * Emit an event
   */
  emit<E extends keyof PluginHooks>(
    event: E,
    ...args: Parameters<PluginHooks[E]>
  ): void;

  /**
   * When a menu item is registered
   */
  menuItemRegistered: (pluginId: string, menuItem: any) => void;

  /**
   * Unsubscribe from an event
   */
  off<E extends keyof PluginHooks>(event: E, handler: PluginHooks[E]): void;

  /**
   * Subscribe to an event
   */
  on<E extends keyof PluginHooks>(
    event: E,
    handler: PluginHooks[E],
  ): () => void;

  /**
   * When a route is registered
   */
  routeRegistered: (pluginId: string, route: RouteRecordRaw) => void;
}

/**
 * Plugin context interface
 * Provided to plugins during setup
 */
export interface PluginContext {
  /**
   * Vue application instance
   */
  app: App;

  /**
   * Get configuration value
   */
  getConfig: <T = any>(key: string, defaultValue?: T) => T;

  /**
   * Get a plugin by ID
   */
  getPlugin: (id: string) => Plugin | undefined;

  /**
   * Get all plugins
   */
  getPlugins: () => Plugin[];

  /**
   * Plugin hooks
   */
  hooks: PluginHooks;

  /**
   * i18n instance
   */
  i18n: I18n;

  /**
   * Log a message
   */
  log: (
    level: 'debug' | 'error' | 'info' | 'warn',
    message: string,
    ...args: any[]
  ) => void;

  /**
   * Register a component
   */
  registerComponent: (name: string, component: Component) => void;

  /**
   * Register localization messages
   */
  registerLocale: (locale: string, messages: Record<string, any>) => void;

  /**
   * Register a menu item
   */
  registerMenuItem: (menuItem: any) => void;

  /**
   * Register a permission
   */
  registerPermission: (permission: string, description?: string) => void;

  /**
   * Register a route
   */
  registerRoute: (route: RouteRecordRaw) => void;

  /**
   * Register a store module
   */
  registerStore: (namespace: string, store: any) => void;

  /**
   * Vue router instance
   */
  router: Router;

  /**
   * Set configuration value
   */
  setConfig: <T = any>(key: string, value: T) => void;
}
