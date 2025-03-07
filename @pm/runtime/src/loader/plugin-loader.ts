// @pm/runtime/src/loader/plugin-loader.ts

import type { PluginImpl, PluginMeta } from '@vben/pm-core';

import { createLogger } from '@vben/pm-core';

import { DatabasePluginLoader } from './loaders/database-loader';
import { InlinePluginLoader } from './loaders/inline-plugin-loader';
import { LocalFilePluginLoader } from './loaders/local-file-loader';
import { RegistryPluginLoader } from './loaders/registry-loader';
import { RemoteFilePluginLoader } from './loaders/remote-file-loader';

// Define source types for plugins
export enum PluginSourceType {
  Database = 'database', // Application database (user-installed)
  Inline = 'inline', // Inline plugin definition
  LocalFile = 'local-file', // Local file system (development)
  Registry = 'registry', // Plugin registry (like npm)
  RemoteFile = 'remote-file', // Remote file (CDN, GitHub, etc.)
}

// Define plugin source interface
export interface PluginSource {
  location: string;
  metadata?: Partial<PluginMeta>;
  options?: Record<string, any>;
  // For inline plugin definitions
  plugins?: Array<[PluginMeta, PluginImpl]>;
  type: PluginSourceType;
}

// Plugin load result
export interface PluginLoadResult {
  error?: Error;
  impl: PluginImpl;
  meta: PluginMeta;
  source: PluginSource;
}

/**
 * Plugin Source Loader Interface
 *
 * Loaders are responsible for loading plugins from a specific source type
 */
export interface PluginSourceLoader {
  loadPlugins(source: PluginSource): Promise<PluginLoadResult[]>;
}

/**
 * Plugin Loader
 *
 * Responsible for loading plugins from various sources
 */
export class PluginLoader {
  private loadedPlugins: Map<string, PluginLoadResult> = new Map();
  private loaders: Record<PluginSourceType, PluginSourceLoader> = {
    [PluginSourceType.Database]: new DatabasePluginLoader(),
    [PluginSourceType.Inline]: new InlinePluginLoader(),
    [PluginSourceType.LocalFile]: new LocalFilePluginLoader(),
    [PluginSourceType.Registry]: new RegistryPluginLoader(),
    [PluginSourceType.RemoteFile]: new RemoteFilePluginLoader(),
  };
  private logger = createLogger({ level: 'info', prefix: '[PluginLoader]' });

  private sources: Map<string, PluginSource> = new Map();

  /**
   * Add a plugin source with inline plugin definitions
   *
   * This method allows you to directly register plugins using the definePlugin pattern
   * without having to load them from an external source
   *
   * @param id Source identifier
   * @param plugins Array of plugin definitions [meta, impl]
   * @param options Additional options
   */
  addInlineSource(
    id: string,
    plugins: Array<[PluginMeta, PluginImpl]>,
    options: Record<string, any> = {},
  ): void {
    this.sources.set(id, {
      location: 'inline',
      options,
      plugins,
      type: PluginSourceType.Inline,
    });
    this.logger.info(
      `Added inline plugin source: ${id} with ${plugins.length} plugin(s)`,
    );
  }

  /**
   * Add a plugin source
   */
  addSource(id: string, source: PluginSource): void {
    this.sources.set(id, source);
    this.logger.info(
      `Added plugin source: ${id} (${source.type}: ${source.location})`,
    );
  }

  /**
   * Get a loaded plugin by ID
   */
  getLoadedPlugin(id: string): PluginLoadResult | undefined {
    return this.loadedPlugins.get(id);
  }

  /**
   * Get all loaded plugins
   */
  getLoadedPlugins(): PluginLoadResult[] {
    return [...this.loadedPlugins.values()];
  }

  /**
   * Get all plugin sources
   */
  getSources(): PluginSource[] {
    return [...this.sources.values()];
  }

  /**
   * Load all plugins from registered sources
   */
  async loadAllPlugins(): Promise<PluginLoadResult[]> {
    this.logger.info(`Loading plugins from ${this.sources.size} sources`);
    const results: PluginLoadResult[] = [];

    for (const [id, source] of this.sources.entries()) {
      try {
        this.logger.info(
          `Loading plugins from source: ${id} (${source.type}: ${source.location})`,
        );
        const loadResults = await this.loadPluginsFromSource(source);
        this.logger.info(
          `Loaded ${loadResults.length} plugins from source: ${id}`,
        );
        results.push(...loadResults);
      } catch (error) {
        this.logger.error(`Error loading plugins from source ${id}:`, error);
      }
    }

    this.logger.info(`Loaded a total of ${results.length} plugins`);
    return results;
  }

  /**
   * Load plugins from a specific source
   */
  async loadPluginsFromSource(
    source: PluginSource,
  ): Promise<PluginLoadResult[]> {
    const loader = this.loaders[source.type];

    if (!loader) {
      throw new Error(
        `No loader available for plugin source type: ${source.type}`,
      );
    }

    const results = await loader.loadPlugins(source);

    // Store loaded plugins
    for (const result of results) {
      this.loadedPlugins.set(result.meta.id, result);
    }

    return results;
  }

  /**
   * Register a custom loader for a source type
   */
  registerLoader(
    type: PluginSourceType | string,
    loader: PluginSourceLoader,
  ): void {
    this.loaders[type as PluginSourceType] = loader;
    this.logger.info(`Registered custom loader for source type: ${type}`);
  }

  /**
   * Remove a plugin source
   */
  removeSource(id: string): boolean {
    const result = this.sources.delete(id);
    if (result) {
      this.logger.info(`Removed plugin source: ${id}`);
    } else {
      this.logger.warn(`Plugin source not found: ${id}`);
    }
    return result;
  }
}
