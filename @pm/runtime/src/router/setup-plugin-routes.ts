import type { Router, RouteRecordRaw } from 'vue-router';

import type { PluginInstance } from '@vben/pm-core';

import { createLogger } from '@vben/pm-core';

const logger = createLogger({ level: 'info', prefix: '[PluginRoutes]' });

/**
 * Setup plugin routes in vue-router
 * This will add all routes from activated plugins to the router
 */
export function setupPluginRoutes(
  router: Router,
  plugins: PluginInstance[],
): void {
  logger.info('Setting up plugin routes');

  // Get activated plugins with routes
  const pluginsWithRoutes = plugins.filter(
    (plugin) => plugin.activated && plugin.routes && plugin.routes.length > 0,
  );

  if (pluginsWithRoutes.length === 0) {
    logger.info('No routes to setup from plugins');
    return;
  }

  // Add routes from each plugin
  for (const plugin of pluginsWithRoutes) {
    if (plugin.routes) {
      for (const route of plugin.routes) {
        logger.info(
          `Adding route from plugin ${plugin.manifest.id}: ${route.path}`,
        );

        // Add the route to the router
        router.addRoute(route);
      }
    }
  }

  logger.info('Plugin routes setup complete');
}

/**
 * Remove plugin routes from vue-router
 * This will remove all routes that were added by the given plugins
 */
export function removePluginRoutes(
  router: Router,
  plugins: PluginInstance[],
): void {
  logger.info('Removing plugin routes');

  // Get plugins with routes
  const pluginsWithRoutes = plugins.filter(
    (plugin) => plugin.routes && plugin.routes.length > 0,
  );

  if (pluginsWithRoutes.length === 0) {
    logger.info('No routes to remove from plugins');
    return;
  }

  // Remove routes from each plugin
  for (const plugin of pluginsWithRoutes) {
    if (plugin.routes) {
      for (const route of plugin.routes) {
        if (route.name) {
          logger.info(
            `Removing route from plugin ${plugin.manifest.id}: ${route.name.toString()}`,
          );

          // Remove the route from the router
          router.removeRoute(route.name);
        }
      }
    }
  }

  logger.info('Plugin routes removal complete');
}

/**
 * Find all routes added by plugins
 */
export function getPluginRoutes(plugins: PluginInstance[]): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = [];

  // Get activated plugins with routes
  const pluginsWithRoutes = plugins.filter(
    (plugin) => plugin.activated && plugin.routes && plugin.routes.length > 0,
  );

  // Collect routes from each plugin
  for (const plugin of pluginsWithRoutes) {
    if (plugin.routes) {
      routes.push(...plugin.routes);
    }
  }

  return routes;
}
