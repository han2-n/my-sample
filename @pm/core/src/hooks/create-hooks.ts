import type { PluginHooks } from '../types/context';
import type { AnyFunction } from '../types/utils';

/**
 * Create plugin hooks system
 *
 * This function creates a hooks system that can be used to subscribe to plugin lifecycle events.
 */
export function createPluginHooks(): PluginHooks {
  // Store for event handlers
  const handlers: {
    [K in keyof PluginHooks]?: Array<PluginHooks[K]>;
  } = {
    afterPluginActivate: [],
    afterPluginDeactivate: [],
    afterPluginSetup: [],
    beforePluginActivate: [],
    beforePluginDeactivate: [],
    beforePluginSetup: [],
    componentRegistered: [],
    routeRegistered: [],
    stateRegistered: [],
    stateRemoved: [],
  };

  // Implementation for each hook function
  const hooks = {
    afterPluginActivate(pluginId: string) {
      emit('afterPluginActivate', pluginId);
    },

    afterPluginDeactivate(pluginId: string) {
      emit('afterPluginDeactivate', pluginId);
    },

    afterPluginSetup(pluginId: string) {
      emit('afterPluginSetup', pluginId);
    },

    beforePluginActivate(pluginId: string) {
      emit('beforePluginActivate', pluginId);
    },

    beforePluginDeactivate(pluginId: string) {
      emit('beforePluginDeactivate', pluginId);
    },

    // Lifecycle hooks
    beforePluginSetup(pluginId: string) {
      emit('beforePluginSetup', pluginId);
    },

    // Registration hooks
    componentRegistered(pluginId: string, name: string, component: any) {
      emit('componentRegistered', pluginId, name, component);
    },

    // Event emission
    emit<E extends keyof PluginHooks>(
      event: E,
      ...args: Parameters<PluginHooks[E]>
    ): void {
      if (!handlers[event]) {
        return;
      }

      for (const handler of handlers[event]) {
        try {
          (handler as AnyFunction)(...args);
        } catch (error) {
          console.error(
            `Error in plugin hook handler for ${String(event)}:`,
            error,
          );
        }
      }
    },

    // Event unsubscription
    off<E extends keyof PluginHooks>(event: E, handler: PluginHooks[E]): void {
      if (!handlers[event]) {
        return;
      }

      const index = handlers[event].indexOf(handler);
      if (index !== -1) {
        handlers[event].splice(index, 1);
      }
    },

    // Event subscription
    on<E extends keyof PluginHooks>(
      event: E,
      handler: PluginHooks[E],
    ): () => void {
      if (!handlers[event]) {
        handlers[event] = [];
      }
      handlers[event].push(handler);

      // Return unsubscribe function
      return () => {
        this.off(event, handler);
      };
    },

    routeRegistered(pluginId: string, route: any) {
      emit('routeRegistered', pluginId, route);
    },

    // State hooks
    stateRegistered(pluginId: string, namespace: string) {
      emit('stateRegistered', pluginId, namespace);
    },

    stateRemoved(pluginId: string, namespace: string) {
      emit('stateRemoved', pluginId, namespace);
    },
  };

  // Helper function to emit events
  function emit<E extends keyof PluginHooks>(
    event: E,
    ...args: Parameters<PluginHooks[E]>
  ): void {
    hooks.emit(event, ...args);
  }

  return hooks;
}
