import type { App, Component, UnwrapRef } from 'vue';
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
  | 'routeRegistered'
  | 'stateRegistered'
  | 'stateRemoved';

/**
 * State change listener type
 */
export type StateChangeListener<T = any> = (
  newValue: T,
  oldValue: T | undefined,
) => void;

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

  /**
   * When a shared state is registered
   */
  stateRegistered: (pluginId: string, namespace: string) => void;

  /**
   * When a shared state is removed
   */
  stateRemoved: (pluginId: string, namespace: string) => void;
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
   * Get a shared state from another plugin
   * @param pluginId The plugin's unique ID that owns the state
   * @param namespace The state namespace
   * @returns The reactive state object or undefined if not found
   */
  getPluginState: <T = any>(
    pluginId: string,
    namespace: string,
  ) => undefined | UnwrapRef<T>;

  /**
   * Check if a state exists
   * @param pluginId The plugin's unique ID that owns the state
   * @param namespace The state namespace
   */
  hasPluginState: (pluginId: string, namespace: string) => boolean;

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
   * Register a permission
   */
  registerPermission: (permission: string, description?: string) => void;

  /**
   * Register a route
   * Note: Use route.meta for menu properties (icon, title, etc.)
   */
  registerRoute: (route: RouteRecordRaw) => void;

  /**
   * Register a shared state that other plugins can access
   * @param namespace The state namespace
   * @param initialState The initial state object
   * @returns The reactive state object
   */
  registerState: <T extends object>(
    namespace: string,
    initialState: T,
  ) => UnwrapRef<T>;

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

  /**
   * Subscribe to changes in a state object
   * @param pluginId The plugin's unique ID that owns the state
   * @param namespace The state namespace
   * @param listener The state change listener function
   * @returns A function to unsubscribe
   */
  subscribeToState: <T = any>(
    pluginId: string,
    namespace: string,
    listener: StateChangeListener<T>,
  ) => () => void;
}
