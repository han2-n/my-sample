import type { Component } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

import type { PluginContext } from './context';

/**
 * Plugin manifest file definition
 * Every plugin must have a manifest.json file in its root directory
 */
export interface PluginManifest {
  /** Plugin author information */
  author?: {
    email?: string;
    name: string;
    url?: string;
  };

  /** Other plugins this plugin depends on */
  dependencies?: string[];

  /** Plugin description */
  description?: string;

  /** Whether the plugin is enabled by default */
  enabled?: boolean;

  /** Plugin entry point (relative to plugin root) */
  entry?: string;

  /** Plugin homepage URL */
  homepage?: string;

  /** Unique plugin identifier */
  id: string;

  /** Plugin license */
  license?: string;

  /** Display name of the plugin */
  name: string;

  /** Plugin repository URL */
  repository?: string;

  /** Custom configuration settings */
  settings?: Record<string, any>;

  /** Plugin tags for categorization */
  tags?: string[];

  /** Plugin version (semver) */
  version?: string;
}

/**
 * Plugin Instance - created when a plugin is loaded
 */
export interface PluginInstance {
  /** Plugin activation function */
  activate?: () => Promise<void> | void;

  /** Activated state */
  activated: boolean;

  /** Components registered by this plugin */
  components?: Record<string, Component>;

  /** Plugin deactivation function */
  deactivate?: () => Promise<void> | void;

  /** Loaded state */
  loaded: boolean;

  /** Plugin manifest data */
  manifest: PluginManifest;

  /** Menu items registered by this plugin */
  menuItems?: any[];

  /** Plugin metadata */
  meta: {
    /** When the plugin was installed */
    installedAt?: Date;

    /** When the plugin was last activated */
    lastActivatedAt?: Date;

    /** When the plugin was last updated */
    updatedAt?: Date;
  };

  /** Routes registered by this plugin */
  routes?: RouteRecordRaw[];

  /** Plugin initialization function */
  setup?: (context: PluginContext) => Promise<void> | void;
}

/**
 * Plugin Manager Options
 */
export interface PluginOptions {
  /** Auto-activate plugins on load */
  autoActivate?: boolean;

  /** Logger options */
  logger?: {
    level: 'debug' | 'error' | 'info' | 'warn';
    prefix?: string;
  };

  /** Enable dependency resolution */
  resolveDependencies?: boolean;

  /** Plugin store directory path */
  storeDir: string;

  /** Strict mode for dependency checking */
  strictDependencies?: boolean;
}
