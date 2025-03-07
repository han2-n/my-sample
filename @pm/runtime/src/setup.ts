import type { App } from 'vue';
import type { I18n } from 'vue-i18n';
import type { Router } from 'vue-router';

import {
  createLogger,
  PluginManager,
  PluginManagerOptions,
  providePluginHooks,
} from '@vben/pm-core';

import { registerPluginComponents } from './components/register';
import { registerPluginLocales, removePluginLocales } from './i18n/register';
import { registerPluginRoutes, removePluginRoutes } from './router/register';
import { usePluginStore } from './store/plugin-store';

const logger = createLogger({ level: 'info', prefix: '[PluginSetup]' });

/**
 * Setup the plugin system for vue-vben-admin
 *
 * This function initializes the plugin manager and sets up all the integrations
 * with Vue.js, Vue Router, Vue I18n, and Pinia.
 *
 * @param app Vue application instance
 * @param router Vue Router instance
 * @param i18n Vue I18n instance
 * @param options Plugin manager options
 * @returns The initialized plugin manager
 */
export async function setupPluginSystem(
  app: App,
  router: Router,
  i18n: I18n,
  options: PluginManagerOptions = {},
): Promise<PluginManager> {
  logger.info('Setting up plugin system');

  // Create and provide plugin hooks
  const hooks = providePluginHooks();

  // Create plugin manager
  const pluginManager = new PluginManager(options);

  // Initialize plugin store
  const pluginStore = usePluginStore();
  await pluginStore.initializePluginManager(pluginManager);

  // Initialize plugin manager
  await pluginManager.init({ app, i18n, router });

  // Set up plugin lifecycle hooks
  setupPluginHooks(app, router, i18n, pluginManager, hooks);

  logger.info('Plugin system setup complete');
  return pluginManager;
}

/**
 * Set up plugin lifecycle hooks
 */
function setupPluginHooks(
  app: App,
  router: Router,
  i18n: I18n,
  pluginManager: PluginManager,
  hooks: any,
): void {
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

      // Note: Components can't be unregistered in Vue, but we can log it
      logger.info(`Plugin ${pluginId} components would be unregistered`);
    }
  });
}
