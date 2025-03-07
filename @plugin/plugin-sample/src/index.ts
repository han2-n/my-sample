// Main plugin entry point
import type { PluginContext } from '@vben/pm-core';

import * as components from './components';
import { localeMessages } from './locales';
import { routes } from './routes';
import { registerStoreModules } from './store';

/**
 * Plugin setup function
 * Called when the plugin is loaded by the plugin manager
 */
export function setup(context: PluginContext): void {
  context.log('info', 'Setting up Sample Plugin');

  // Register all components
  for (const [name, component] of Object.entries(components)) {
    context.registerComponent(name, component);
    context.log('debug', `Registered component: ${name}`);
  }

  // Register routes
  for (const route of routes) {
    context.registerRoute(route);
    context.log('debug', `Registered route: ${route.path}`);
  }

  // Register store modules
  registerStoreModules(context);

  // Register locales
  for (const [locale, messages] of Object.entries(localeMessages)) {
    context.registerLocale(locale, messages);
    context.log('debug', `Registered locale: ${locale}`);
  }

  // Register plugin hooks
  context.hooks.on('afterActivate', (pluginId) => {
    if (pluginId !== 'sample') {
      context.log('info', `Another plugin was activated: ${pluginId}`);
    }
  });

  // Register permissions
  context.registerPermission('sample.view', 'View sample plugin content');
  context.registerPermission('sample.edit', 'Edit sample plugin content');
  context.registerPermission('sample.admin', 'Administer sample plugin');

  context.log('info', 'Sample Plugin setup complete');
}

/**
 * Plugin activation function
 * Called when the plugin is activated
 */
export function activate(): void {
  console.log('Sample Plugin activated');
}

/**
 * Plugin deactivation function
 * Called when the plugin is deactivated
 */
export function deactivate(): void {
  console.log('Sample Plugin deactivated');
}
