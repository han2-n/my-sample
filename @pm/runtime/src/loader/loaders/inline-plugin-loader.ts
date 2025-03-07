import type {
  PluginLoadResult,
  PluginSource,
  PluginSourceLoader,
} from '../plugin-loader';

import { createLogger } from '@vben/pm-core';

/**
 * Inline Plugin Loader
 *
 * Handles inline plugin definitions directly passed to the loader
 * This allows for plugins to be defined and loaded without needing
 * to be loaded from an external source
 */
export class InlinePluginLoader implements PluginSourceLoader {
  private logger = createLogger({
    level: 'info',
    prefix: '[InlinePluginLoader]',
  });

  /**
   * Load plugins from an inline source
   *
   * @param source Plugin source configuration with inline plugins
   */
  async loadPlugins(source: PluginSource): Promise<PluginLoadResult[]> {
    this.logger.info(`Loading inline plugins`);

    try {
      if (
        !source.plugins ||
        !Array.isArray(source.plugins) ||
        source.plugins.length === 0
      ) {
        this.logger.warn('No inline plugins provided');
        return [];
      }

      const results: PluginLoadResult[] = [];

      // Process each plugin definition
      for (const [meta, impl] of source.plugins) {
        try {
          // Validate plugin metadata
          if (!meta.id) {
            throw new Error('Plugin ID is required');
          }

          this.logger.info(`Loaded inline plugin: ${meta.id}`);

          // Create load result
          results.push({
            impl,
            meta,
            source,
          });
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          this.logger.error(`Error processing inline plugin ${meta.id}:`, err);

          // Include error in the result
          results.push({
            error: err,
            impl,
            meta,
            source,
          });
        }
      }

      return results;
    } catch (error) {
      this.logger.error(`Error loading inline plugins:`, error);
      return [];
    }
  }
}
