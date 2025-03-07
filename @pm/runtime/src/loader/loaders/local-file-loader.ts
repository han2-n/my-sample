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
      // In a real implementation, this would use dynamic imports
      // For development environments, plugins would be in a known directory

      // Example implementation for Node.js environment:
      /*
      const fs = require('fs');
      const path = require('path');
      
      const pluginDir = source.location;
      const pluginFolders = fs.readdirSync(pluginDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      const results: PluginLoadResult[] = [];
      
      for (const folder of pluginFolders) {
        const pluginPath = path.join(pluginDir, folder);
        const indexPath = path.join(pluginPath, 'index.js');
        
        if (fs.existsSync(indexPath)) {
          try {
            // Dynamic import
            const pluginModule = await import(indexPath);
            
            // Assuming the default export is a tuple of [meta, impl]
            const [meta, impl] = pluginModule.default;
            
            results.push({
              meta,
              impl,
              source
            });
          } catch (error) {
            this.logger.error(`Error loading plugin from ${pluginPath}:`, error);
          }
        }
      }
      
      return results;
      */

      // For browser environment, we'll use a placeholder implementation
      // In a real app, this would be implemented differently, possibly
      // using a webpack context or a manifest file

      // Placeholder implementation
      return [];
    } catch (error) {
      this.logger.error(
        `Error loading plugins from ${source.location}:`,
        error,
      );
      return [];
    }
  }
}
