import type { App } from 'vue';
import type { I18n } from 'vue-i18n';
import type { Router } from 'vue-router';

import type { PluginOptions } from '@vben/pm-core';

import { createLogger, PluginManager, providePluginHooks } from '@vben/pm-core';

import { registerPluginComponents } from './components/register-components';
import { setupPluginLocales } from './locales/setup-plugin-locales';
import { setupPluginRoutes } from './router/setup-plugin-routes';
import { usePluginStore } from './store/plugin';

const logger = createLogger({ level: 'info', prefix: '[PluginSetup]' });

/**
 * Setup the plugin system for vue-vben-admin
 */
export async function setupPluginSystem(
  app: App,
  router: Router,
  i18n: I18n,
  options: PluginOptions,
): Promise<PluginManager> {
  logger.info('Setting up plugin system');

  // Create the plugin hooks and provide them to Vue components
  providePluginHooks();

  // Create the plugin manager
  const pluginManager = new PluginManager(options);

  // Initialize the plugin store
  const pluginStore = usePluginStore();
  await pluginStore.initializePluginManager(pluginManager);

  // Initialize the plugin manager
  await pluginManager.init({
    app,
    i18n,
    router,
    // Pass the pinia store instance
    store: pluginStore,
  });

  // Setup plugins in the application
  setupPluginsInApplication(app, router, i18n, pluginManager);

  // Listen for plugin activation/deactivation
  setupPluginHooks(app, router, i18n, pluginManager);

  logger.info('Plugin system setup complete');
  return pluginManager;
}

/**
 * Setup activated plugins in the application
 */
function setupPluginsInApplication(
  app: App,
  router: Router,
  i18n: I18n,
  pluginManager: PluginManager,
): void {
  const activatedPlugins = pluginManager.getActivatedPlugins();

  // Setup routes
  setupPluginRoutes(router, activatedPlugins);

  // Register components
  registerPluginComponents(app, activatedPlugins);

  // Setup locales
  setupPluginLocales(i18n, activatedPlugins);
}

/**
 * Setup hooks for plugin lifecycle events
 */
function setupPluginHooks(
  app: App,
  router: Router,
  i18n: I18n,
  pluginManager: PluginManager,
): void {
  const hooks = (pluginManager as any).hooks;

  if (!hooks) {
    logger.warn('Plugin hooks not available');
    return;
  }

  // Listen for plugin activation
  hooks.on('afterActivate', (pluginId: string) => {
    logger.info(`Plugin activated: ${pluginId}`);

    const plugin = pluginManager.getPlugin(pluginId);
    if (plugin) {
      // Setup routes for this plugin
      setupPluginRoutes(router, [plugin]);

      // Register components for this plugin
      registerPluginComponents(app, [plugin]);

      // Setup locales for this plugin
      setupPluginLocales(i18n, [plugin]);
    }
  });

  // Listen for plugin deactivation
  hooks.on('afterDeactivate', (pluginId: string) => {
    logger.info(`Plugin deactivated: ${pluginId}`);

    const plugin = pluginManager.getPlugin(pluginId);
    if (plugin) {
      // We would remove routes, components, and locales here
      // but for now, let's just log it
      logger.info(`Plugin ${pluginId} deactivated, resources would be removed`);
    }
  });
}
