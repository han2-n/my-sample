import type { PluginContext } from '@vben/pm-core';

/**
 * Register store modules with the plugin context
 */
export function registerStoreModules(context: PluginContext): void {
  // No need to register the store since Pinia auto-registers stores when they're used
  // But we can log that the store is available
  context.log('info', 'Sample store module is available');
}

export { useSampleStore } from './sample';
