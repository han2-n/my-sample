import type { Component } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

import type { PluginContext } from './context';

/**
 * Plugin metadata
 */
export interface PluginMeta {
  /**
   * Author information
   */
  author?: {
    email?: string;
    name: string;
    url?: string;
  };

  /**
   * Dependencies on other plugins
   */
  dependencies?: string[];

  /**
   * Description of the plugin
   */
  description?: string;

  /**
   * Whether the plugin is enabled by default
   */
  enabled?: boolean;

  /**
   * Plugin homepage URL
   */
  homepage?: string;

  /**
   * Unique plugin identifier
   */
  id: string;

  /**
   * Plugin license
   */
  license?: string;

  /**
   * Display name of the plugin
   */
  name: string;

  /**
   * Custom plugin settings
   */
  settings?: Record<string, any>;

  /**
   * Plugin tags for categorization
   */
  tags?: string[];

  /**
   * Plugin version (semver)
   */
  version?: string;
}

/**
 * Plugin implementation
 */
export interface PluginImpl {
  /**
   * Additional methods and properties
   */
  [key: string]: any;

  /**
   * Activation function when the plugin is activated
   */
  activate?: () => Promise<void> | void;

  /**
   * Deactivation function when the plugin is deactivated
   */
  deactivate?: () => Promise<void> | void;

  /**
   * Setup function is called when the plugin is loaded
   * Register components, routes, etc.
   */
  setup?: (context: PluginContext) => Promise<void> | void;
}

/**
 * Plugin instance
 */
export interface Plugin {
  /**
   * Components registered by this plugin
   */
  components?: Record<string, Component>;

  /**
   * Plugin implementation
   */
  impl: PluginImpl;

  /**
   * Plugin metadata
   */
  meta: PluginMeta;

  /**
   * Routes registered by this plugin
   * Note: Routes include menu metadata in their 'meta' property
   */
  routes?: RouteRecordRaw[];

  /**
   * Plugin status
   */
  status: {
    /**
     * Last activated timestamp
     */
    activatedAt?: Date;

    /**
     * Whether the plugin is active
     */
    active: boolean;

    /**
     * Installation timestamp
     */
    installedAt: Date;

    /**
     * Whether the plugin is loaded (setup executed)
     */
    loaded: boolean;

    /**
     * Last updated timestamp
     */
    updatedAt?: Date;
  };
}

/**
 * Plugin options passed to definePlugin
 */
export type PluginOptions = Omit<PluginMeta, 'id'>;

/**
 * Plugin manager options
 */
export interface PluginManagerOptions {
  /**
   * Whether to automatically activate plugins on registration
   */
  autoActivate?: boolean;

  /**
   * Logger options
   */
  logger?: {
    level: 'debug' | 'error' | 'info' | 'warn';
    prefix?: string;
  };

  /**
   * Whether to resolve dependencies
   */
  resolveDependencies?: boolean;

  /**
   * Whether to enforce strict dependency checking
   */
  strictDependencies?: boolean;
}
