import type { PluginHooks } from '../types/context';

import { inject, provide } from 'vue';

import { createPluginHooks } from './create-hooks';

// Symbol for providing/injecting hooks
const PLUGIN_HOOKS_SYMBOL = Symbol('plugin-hooks');

/**
 * Create and provide plugin hooks
 */
export function providePluginHooks(): PluginHooks {
  const hooks = createPluginHooks();
  provide(PLUGIN_HOOKS_SYMBOL, hooks);
  return hooks;
}

/**
 * Use plugin hooks from a component
 */
export function usePluginHooks(): PluginHooks {
  const hooks = inject<PluginHooks>(PLUGIN_HOOKS_SYMBOL);

  if (!hooks) {
    throw new Error(
      'Plugin hooks not provided. Did you call providePluginHooks?',
    );
  }

  return hooks;
}
