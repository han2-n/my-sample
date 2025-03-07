import { reactive, UnwrapRef, watch } from 'vue';

import { createLogger } from './logger';

/**
 * Options for the state registry
 */
interface StateRegistryOptions {
  logger?: {
    level: 'debug' | 'error' | 'info' | 'warn';
    prefix?: string;
  };
}

/**
 * State change listener
 */
type StateChangeListener<T = any> = (
  newValue: T,
  oldValue: T | undefined,
) => void;

/**
 * Plugin State Registry
 *
 * Manages shared state between plugins and provides reactivity
 */
export class PluginStateRegistry {
  private logger;
  private stateListeners = new Map<string, Set<StateChangeListener>>();
  private states = new Map<string, any>();

  constructor(options: StateRegistryOptions = {}) {
    this.logger = createLogger({
      level: options.logger?.level || 'info',
      prefix: options.logger?.prefix || '[StateRegistry]',
    });
  }

  /**
   * Clear all states from a plugin
   *
   * @param pluginId The plugin's unique ID
   */
  clearPluginStates(pluginId: string): void {
    for (const stateKey of this.states.keys()) {
      if (stateKey.startsWith(`${pluginId}:`)) {
        this.states.delete(stateKey);
        this.stateListeners.delete(stateKey);
      }
    }

    this.logger.debug(`Cleared all states for plugin ${pluginId}`);
  }

  /**
   * Get a state object
   *
   * @param pluginId The plugin's unique ID
   * @param namespace The state namespace
   * @returns The reactive state object or undefined if not found
   */
  getState<T = any>(
    pluginId: string,
    namespace: string,
  ): undefined | UnwrapRef<T> {
    const stateKey = `${pluginId}:${namespace}`;
    return this.states.get(stateKey);
  }

  /**
   * Check if a state exists
   *
   * @param pluginId The plugin's unique ID
   * @param namespace The state namespace
   * @returns True if the state exists
   */
  hasState(pluginId: string, namespace: string): boolean {
    const stateKey = `${pluginId}:${namespace}`;
    return this.states.has(stateKey);
  }

  /**
   * Register a new state object for a plugin
   *
   * @param pluginId The plugin's unique ID
   * @param namespace The state namespace (to organize state hierarchically)
   * @param initialState The initial state value
   * @returns The reactive state object
   */
  registerState<T extends object>(
    pluginId: string,
    namespace: string,
    initialState: T,
  ): UnwrapRef<T> {
    const stateKey = `${pluginId}:${namespace}`;

    if (this.states.has(stateKey)) {
      this.logger.warn(
        `State already registered for ${stateKey}, returning existing state`,
      );
      return this.states.get(stateKey);
    }

    // Create a reactive state object
    const state = reactive<T>({ ...initialState });
    this.states.set(stateKey, state);

    this.logger.debug(`Registered state for ${stateKey}`);
    return state;
  }

  /**
   * Remove a state
   *
   * @param pluginId The plugin's unique ID
   * @param namespace The state namespace
   * @returns True if the state was removed
   */
  removeState(pluginId: string, namespace: string): boolean {
    const stateKey = `${pluginId}:${namespace}`;

    if (!this.states.has(stateKey)) {
      return false;
    }

    this.states.delete(stateKey);
    this.stateListeners.delete(stateKey);

    this.logger.debug(`Removed state for ${stateKey}`);
    return true;
  }

  /**
   * Subscribe to changes in a state object
   *
   * @param pluginId The plugin's unique ID
   * @param namespace The state namespace
   * @param listener The state change listener function
   * @returns A function to unsubscribe
   */
  subscribeToState<T = any>(
    pluginId: string,
    namespace: string,
    listener: StateChangeListener<T>,
  ): () => void {
    const stateKey = `${pluginId}:${namespace}`;

    // Create listeners set if it doesn't exist
    if (!this.stateListeners.has(stateKey)) {
      this.stateListeners.set(stateKey, new Set());
    }

    const listeners = this.stateListeners.get(stateKey);
    if (!listeners) return () => {};
    listeners.add(listener);

    // Setup watch if this is the first listener
    if (listeners.size === 1) {
      const state = this.getState(pluginId, namespace);
      if (state) {
        watch(
          () => state,
          (newValue, oldValue) => {
            for (const l of listeners) {
              l(newValue, oldValue);
            }
          },
          { deep: true },
        );
      }
    }

    // Return unsubscribe function
    return () => {
      const listeners = this.stateListeners.get(stateKey);
      if (listeners) {
        listeners.delete(listener);
      }
    };
  }
}
