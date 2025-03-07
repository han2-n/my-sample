import type {
  PluginLoadResult,
  PluginSource,
  PluginSourceLoader,
} from '../plugin-loader';

import { createLogger } from '@vben/pm-core';

/**
 * Local File Plugin Loader
 *
 * Loads plugins from the local file system
 */
export class LocalFilePluginLoader implements PluginSourceLoader {
  private logger = createLogger({ level: 'info', prefix: '[LocalFileLoader]' });

  /**
   * Load plugins from a local file source
   *
   * @param source Plugin source configuration
   */
  async loadPlugins(source: PluginSource): Promise<PluginLoadResult[]> {
    this.logger.info(
      `Loading plugins from local directory: ${source.location}`,
    );

    try {
      // In a browser environment, this loader would use a manifest file or other approach
      // to determine which plugins to import

      // This is a simplified implementation for browser environments
      const results: PluginLoadResult[] = [];

      // The location could be a path pattern for dynamic imports
      // For example: './plugins/**/*.ts'

      // We'll assume modules is an object with import functions obtained from
      // import.meta.glob or similar Vite/Webpack feature
      if (source.modules) {
        for (const [path, importFn] of Object.entries(source.modules)) {
          try {
            // Execute the dynamic import
            const moduleExports = await importFn();

            // Get the default export which should be a tuple of [meta, impl]
            const pluginDef = moduleExports.default;

            if (
              !pluginDef ||
              !Array.isArray(pluginDef) ||
              pluginDef.length !== 2
            ) {
              this.logger.warn(`Invalid plugin definition in ${path}`);
              continue;
            }

            const [meta, impl] = pluginDef;

            results.push({
              impl,
              meta,
              source,
            });

            this.logger.info(`Loaded plugin from ${path}: ${meta.id}`);
          } catch (error) {
            this.logger.error(`Error loading plugin from ${path}:`, error);
          }
        }
      } else {
        this.logger.warn(
          `No modules provided for local file source: ${source.location}`,
        );
      }

      return results;
    } catch (error) {
      this.logger.error(
        `Error loading plugins from ${source.location}:`,
        error,
      );
      return [];
    }
  }
}
