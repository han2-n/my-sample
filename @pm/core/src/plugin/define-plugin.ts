import { PluginImpl, PluginMeta, PluginOptions } from '../types';

/**
 * Define a plugin
 *
 * This function is used to create a plugin that can be registered with the plugin manager.
 * It provides a clear structure for plugin metadata and implementation.
 *
 * @example
 * ```ts
 * // Define a plugin
 * export default definePlugin('my-plugin', {
 *   name: 'My Plugin',
 *   description: 'A sample plugin',
 *   version: '1.0.0',
 *   dependencies: ['core']
 * }, {
 *   setup(context) {
 *     // Register components, routes, etc.
 *     context.registerComponent('MyComponent', MyComponent);
 *   },
 *   activate() {
 *     console.log('My plugin activated');
 *   },
 *   deactivate() {
 *     console.log('My plugin deactivated');
 *   }
 * });
 * ```
 *
 * @param id - The unique identifier for the plugin
 * @param options - Plugin metadata options
 * @param implementation - Plugin implementation with lifecycle methods
 * @returns The plugin definition
 */
export function definePlugin(
  id: string,
  options: PluginOptions,
  implementation: PluginImpl,
): [PluginMeta, PluginImpl] {
  // Validate plugin ID
  if (!id || typeof id !== 'string') {
    throw new Error('Plugin ID is required and must be a string');
  }

  // Create plugin metadata
  const meta: PluginMeta = {
    author: options.author,
    dependencies: options.dependencies || [],
    description: options.description,
    enabled: options.enabled !== false, // Default to enabled
    homepage: options.homepage,
    id,
    license: options.license,
    name: options.name || id,
    settings: options.settings || {},
    tags: options.tags || [],
    version: options.version || '1.0.0',
  };

  // Return the plugin definition as a tuple
  return [meta, implementation];
}

/**
 * Alternative function signature that accepts a single object
 */
export function definePluginObject(plugin: {
  [key: string]: any;
  activate?: PluginImpl['activate'];
  deactivate?: PluginImpl['deactivate'];
  id: string;
  meta: PluginOptions;
  setup?: PluginImpl['setup'];
}): [PluginMeta, PluginImpl] {
  const { activate, deactivate, id, meta, setup, ...rest } = plugin;

  return definePlugin(id, meta, { activate, deactivate, setup, ...rest });
}
