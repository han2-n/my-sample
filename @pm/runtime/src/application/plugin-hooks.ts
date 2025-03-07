import type { App } from 'vue';
import type { I18n } from 'vue-i18n';
import type { Router } from 'vue-router';

import type { PluginManager } from '@vben/pm-core';

import { createLogger } from '@vben/pm-core';

import { registerPluginComponents } from '../components/register';
import { registerPluginLocales, removePluginLocales } from '../i18n/register';
import { registerPluginRoutes, removePluginRoutes } from '../router/register';

const logger = createLogger({ level: 'info', prefix: '[PluginHooks]' });

/**
 * Set up hooks for plugin lifecycle events
 *
 * @param pluginManager Plugin manager instance
 * @param appInstances Vue application instances
 */
export function setupPluginHooks(
  pluginManager: PluginManager,
  appInstances: { app: App; i18n: I18n; router: Router },
): void {
  const { app, i18n, router } = appInstances;

  // Get hooks from plugin manager
  const hooks = (pluginManager as any).hooks;

  if (!hooks) {
    logger.warn('Plugin hooks not available');
    return;
  }

  // After plugin activation
  hooks.on('afterPluginActivate', (pluginId: string) => {
    logger.info(`Plugin activated: ${pluginId}`);

    const plugin = pluginManager.getPlugin(pluginId);
    if (plugin) {
      // Register components, routes, and locales for this plugin
      registerPluginComponents(app, [plugin]);
      registerPluginRoutes(router, [plugin]);
      registerPluginLocales(i18n, [plugin]);
    }
  });

  // After plugin deactivation
  hooks.on('afterPluginDeactivate', (pluginId: string) => {
    logger.info(`Plugin deactivated: ${pluginId}`);

    const plugin = pluginManager.getPlugin(pluginId);
    if (plugin) {
      // Remove routes and locales for this plugin
      removePluginRoutes(router, [plugin]);
      removePluginLocales(i18n, [plugin]);

      // Note: Components can't be unregistered in Vue
      logger.info(
        `Plugin ${pluginId} components would be unregistered if Vue supported it`,
      );
    }
  });

  // Component registration
  hooks.on('componentRegistered', (pluginId: string, name: string) => {
    logger.info(`Component registered by plugin ${pluginId}: ${name}`);
  });

  // Route registration
  hooks.on('routeRegistered', (pluginId: string, route: any) => {
    logger.info(`Route registered by plugin ${pluginId}: ${route.path}`);
  });

  // Menu item registration
  hooks.on('menuItemRegistered', (pluginId: string, menuItem: any) => {
    logger.info(`Menu item registered by plugin ${pluginId}: ${menuItem.name}`);
  });

  // Before plugin setup
  hooks.on('beforePluginSetup', (pluginId: string) => {
    logger.info(`Setting up plugin: ${pluginId}`);
  });

  // After plugin setup
  hooks.on('afterPluginSetup', (pluginId: string) => {
    logger.info(`Plugin setup completed: ${pluginId}`);
  });

  // Before plugin activation
  hooks.on('beforePluginActivate', (pluginId: string) => {
    logger.info(`Activating plugin: ${pluginId}`);
  });

  // Before plugin deactivation
  hooks.on('beforePluginDeactivate', (pluginId: string) => {
    logger.info(`Deactivating plugin: ${pluginId}`);
  });

  logger.info('Plugin hooks setup completed');
}
