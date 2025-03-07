import { inject, provide } from 'vue';

import { PluginHooks } from '../types';
import { createPluginHooks } from './create-hooks';

// Symbol for providing/injecting hooks
const PLUGIN_HOOKS_SYMBOL = Symbol('plugin-hooks');

/**
 * Create and provide plugin hooks
 *
 * This function creates plugin hooks and provides them to Vue components
 *
 * @returns The created hooks object
 */
export function providePluginHooks(): PluginHooks {
  const hooks = createPluginHooks();
  provide(PLUGIN_HOOKS_SYMBOL, hooks);
  return hooks;
}

/**
 * Use plugin hooks in a Vue component
 *
 * This composable gives access to the plugin hooks system
 *
 * @example
 * ```ts
 * // In a Vue component
 * const hooks = usePluginHooks();
 *
 * // Subscribe to plugin activation events
 * onMounted(() => {
 *   const unsubscribe = hooks.on('afterPluginActivate', (pluginId) => {
 *     console.log(`Plugin ${pluginId} was activated`);
 *   });
 *
 *   // Cleanup on component unmount
 *   onUnmounted(() => {
 *     unsubscribe();
 *   });
 * });
 * ```
 *
 * @returns The hooks object
 * @throws Error if hooks are not provided
 */
export function usePluginHooks(): PluginHooks {
  const hooks = inject<PluginHooks>(PLUGIN_HOOKS_SYMBOL);

  if (!hooks) {
    throw new Error(
      'Plugin hooks not provided. Make sure to call providePluginHooks() in your setup.',
    );
  }

  return hooks;
}
