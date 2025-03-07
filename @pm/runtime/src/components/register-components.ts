import type { App } from 'vue';

import type { PluginInstance } from '@vben/pm-core';

import { createLogger } from '@vben/pm-core';

const logger = createLogger({ level: 'info', prefix: '[PluginComponents]' });

/**
 * Register components from plugins
 * This will register all components from activated plugins
 */
export function registerPluginComponents(
  app: App,
  plugins: PluginInstance[],
): void {
  logger.info('Registering plugin components');

  // Get activated plugins with components
  const pluginsWithComponents = plugins.filter(
    (plugin) =>
      plugin.activated &&
      plugin.components &&
      Object.keys(plugin.components).length > 0,
  );

  if (pluginsWithComponents.length === 0) {
    logger.info('No components to register from plugins');
    return;
  }

  // Register components from each plugin
  for (const plugin of pluginsWithComponents) {
    if (plugin.components) {
      for (const [name, component] of Object.entries(plugin.components)) {
        logger.info(
          `Registering component from plugin ${plugin.manifest.id}: ${name}`,
        );

        // Register the component with the Vue app
        app.component(name, component);
      }
    }
  }

  logger.info('Plugin components registration complete');
}

/**
 * Unregister components from plugins
 * Note: Vue doesn't have an official way to unregister components,
 * so this function is a no-op and is provided for API symmetry
 */
export function unregisterPluginComponents(
  _app: App,
  plugins: PluginInstance[],
): void {
  logger.info('Unregistering plugin components');
  logger.warn(
    'Vue does not support unregistering components. This is a no-op.',
  );

  // Get plugins with components
  const pluginsWithComponents = plugins.filter(
    (plugin) => plugin.components && Object.keys(plugin.components).length > 0,
  );

  if (pluginsWithComponents.length === 0) {
    logger.info('No components to unregister from plugins');
    return;
  }

  // Log components that would be unregistered
  for (const plugin of pluginsWithComponents) {
    if (plugin.components) {
      for (const name of Object.keys(plugin.components)) {
        logger.info(
          `Would unregister component from plugin ${plugin.manifest.id}: ${name}`,
        );
      }
    }
  }

  logger.info('Plugin components unregistration complete (no-op)');
}
