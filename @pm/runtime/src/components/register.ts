import type { App } from 'vue';

import type { Plugin } from '@vben/pm-core';

import { createLogger } from '@vben/pm-core';

const logger = createLogger({
  level: 'info',
  prefix: '[Component Registration]',
});

/**
 * Register components from plugins to the Vue app
 *
 * @param app Vue application instance
 * @param plugins Array of active plugins
 */
export function registerPluginComponents(app: App, plugins: Plugin[]): void {
  logger.info('Registering plugin components');

  // Filter plugins with components
  const pluginsWithComponents = plugins.filter(
    (plugin) =>
      plugin.status.active &&
      plugin.components &&
      Object.keys(plugin.components).length > 0,
  );

  if (pluginsWithComponents.length === 0) {
    logger.info('No components to register');
    return;
  }

  // Register components for each plugin
  for (const plugin of pluginsWithComponents) {
    if (!plugin.components) continue;

    for (const [name, component] of Object.entries(plugin.components)) {
      logger.info(
        `Registering component from plugin ${plugin.meta.id}: ${name}`,
      );
      app.component(name, component);
    }
  }

  logger.info('Component registration complete');
}

/**
 * Unregister components from plugins
 * Note: Vue doesn't have a way to unregister components,
 * so this is just a placeholder for API symmetry
 *
 * @param app Vue application instance
 * @param plugins Array of plugins to unregister
 */
export function unregisterPluginComponents(app: App, plugins: Plugin[]): void {
  logger.warn(
    'Vue does not support unregistering components - this is a no-op',
  );

  // Log components that would be unregistered
  for (const plugin of plugins) {
    if (plugin.components) {
      for (const name of Object.keys(plugin.components)) {
        logger.info(
          `Would unregister component from plugin ${plugin.meta.id}: ${name}`,
        );
      }
    }
  }
}
