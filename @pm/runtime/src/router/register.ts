import type { Router, RouteRecordRaw } from 'vue-router';

import type { Plugin } from '@vben/pm-core';

import { createLogger } from '@vben/pm-core';

const logger = createLogger({ level: 'info', prefix: '[Router Registration]' });

/**
 * Register routes from plugins
 *
 * @param router Vue Router instance
 * @param plugins Array of active plugins
 */
export function registerPluginRoutes(router: Router, plugins: Plugin[]): void {
  logger.info('Registering plugin routes');

  // Filter plugins with routes
  const pluginsWithRoutes = plugins.filter(
    (plugin) =>
      plugin.status.active && plugin.routes && plugin.routes.length > 0,
  );

  if (pluginsWithRoutes.length === 0) {
    logger.info('No routes to register');
    return;
  }

  // Register routes for each plugin
  for (const plugin of pluginsWithRoutes) {
    if (!plugin.routes) continue;

    for (const route of plugin.routes) {
      logger.info(
        `Registering route from plugin ${plugin.meta.id}: ${route.path}`,
      );
      router.addRoute(route);
    }
  }

  logger.info('Route registration complete');
}

/**
 * Remove routes from plugins
 *
 * @param router Vue Router instance
 * @param plugins Array of plugins to remove routes from
 */
export function removePluginRoutes(router: Router, plugins: Plugin[]): void {
  logger.info('Removing plugin routes');

  // Filter plugins with routes
  const pluginsWithRoutes = plugins.filter(
    (plugin) => plugin.routes && plugin.routes.length > 0,
  );

  if (pluginsWithRoutes.length === 0) {
    logger.info('No routes to remove');
    return;
  }

  // Remove routes for each plugin
  for (const plugin of pluginsWithRoutes) {
    if (!plugin.routes) continue;

    for (const route of plugin.routes) {
      if (route.name) {
        logger.info(
          `Removing route from plugin ${plugin.meta.id}: ${String(route.name)}`,
        );
        router.removeRoute(route.name);
      } else {
        logger.warn(`Cannot remove route without name: ${route.path}`);
      }
    }
  }

  logger.info('Route removal complete');
}

/**
 * Get all routes from plugins
 *
 * @param plugins Array of plugins
 * @returns Array of routes from all active plugins
 */
export function getPluginRoutes(plugins: Plugin[]): RouteRecordRaw[] {
  // Filter active plugins with routes
  const activePlugins = plugins.filter(
    (plugin) =>
      plugin.status.active && plugin.routes && plugin.routes.length > 0,
  );

  // Collect routes
  const routes: RouteRecordRaw[] = [];
  for (const plugin of activePlugins) {
    if (plugin.routes) {
      routes.push(...plugin.routes);
    }
  }

  return routes;
}
