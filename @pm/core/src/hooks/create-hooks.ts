import type { PluginHooks } from '../types/context';

/**
 * Create plugin hooks with event emitter functionality
 */
export function createPluginHooks(): PluginHooks {
  // Store event listeners
  const listeners: Record<string, Array<(...args: any[]) => void>> = {
    afterActivate: [],
    afterDeactivate: [],
    beforeActivate: [],
    beforeDeactivate: [],
    onComponentRegistered: [],
    onMenuItemRegistered: [],
    onRouteRegistered: [],
  };

  // Create a function for each hook that calls all registered listeners
  const hooks = {
    afterActivate(pluginId: string) {
      listeners.afterActivate.forEach((fn) => fn(pluginId));
    },

    afterDeactivate(pluginId: string) {
      listeners.afterDeactivate.forEach((fn) => fn(pluginId));
    },

    beforeActivate(pluginId: string) {
      listeners.beforeActivate.forEach((fn) => fn(pluginId));
    },

    beforeDeactivate(pluginId: string) {
      listeners.beforeDeactivate.forEach((fn) => fn(pluginId));
    },

    onComponentRegistered(pluginId: string, componentName: string) {
      listeners.onComponentRegistered.forEach((fn) =>
        fn(pluginId, componentName),
      );
    },

    onMenuItemRegistered(pluginId: string, menuItem: any) {
      listeners.onMenuItemRegistered.forEach((fn) => fn(pluginId, menuItem));
    },

    onRouteRegistered(pluginId: string, route: any) {
      listeners.onRouteRegistered.forEach((fn) => fn(pluginId, route));
    },
  };

  // Add methods to manage listeners
  const hooksWithMethods = {
    ...hooks,

    // Remove an event listener
    off<K extends keyof PluginHooks>(event: K, listener: PluginHooks[K]) {
      const index = listeners[event].indexOf(listener as any);
      if (index !== -1) {
        listeners[event].splice(index, 1);
      }
    },

    // Add an event listener
    on<K extends keyof PluginHooks>(event: K, listener: PluginHooks[K]) {
      listeners[event].push(listener as any);

      // Return unsubscribe function
      return () => {
        const index = listeners[event].indexOf(listener as any);
        if (index !== -1) {
          listeners[event].splice(index, 1);
        }
      };
    },
  };

  return hooksWithMethods as PluginHooks;
}
