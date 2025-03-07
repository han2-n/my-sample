import type { Plugin } from '../types/plugin';

/**
 * Sort plugins by dependency order
 *
 * This ensures that plugins are activated in the correct order
 * so that dependencies are activated before the plugins that depend on them.
 *
 * @param plugins Map of plugin ID to plugin object
 * @param strict Whether to throw on missing dependencies
 * @returns Sorted array of plugins
 */
export function sortPluginsByDependencies(
  plugins: Record<string, Plugin>,
  strict = false,
): Plugin[] {
  const result: Plugin[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  // Visit each plugin
  for (const [id, plugin] of Object.entries(plugins)) {
    if (!visited.has(id)) {
      visitPlugin(id, plugin);
    }
  }

  /**
   * Visit a plugin and its dependencies
   */
  function visitPlugin(id: string, plugin: Plugin) {
    // If already processed, skip
    if (visited.has(id)) {
      return;
    }

    // Detect circular dependencies
    if (visiting.has(id)) {
      throw new Error(`Circular dependency detected: ${id}`);
    }

    visiting.add(id);

    // Visit dependencies first
    if (plugin.meta.dependencies?.length) {
      for (const depId of plugin.meta.dependencies) {
        const dependency = plugins[depId];

        if (dependency) {
          visitPlugin(depId, dependency);
        } else {
          if (strict) {
            throw new Error(`Missing dependency: ${depId} required by ${id}`);
          } else {
            // Skip missing dependencies in non-strict mode
            continue;
          }
        }
      }
    }

    // Mark as visited
    visiting.delete(id);
    visited.add(id);

    // Add to result
    result.push(plugin);
  }

  return result;
}

/**
 * Check if a plugin's dependencies are satisfied
 *
 * @param plugin Plugin to check
 * @param availablePlugins Available plugins
 * @returns Whether all dependencies are available
 */
export function hasDependenciesSatisfied(
  plugin: Plugin,
  availablePlugins: Record<string, Plugin>,
): boolean {
  // If no dependencies, they are satisfied
  if (!plugin.meta.dependencies?.length) {
    return true;
  }

  // Check each dependency
  for (const depId of plugin.meta.dependencies) {
    const dependency = availablePlugins[depId];
    if (!dependency || !dependency.status.active) {
      return false;
    }
  }

  return true;
}

/**
 * Get an array of plugin IDs that a plugin depends on
 *
 * @param plugin Plugin to check
 * @param availablePlugins Available plugins
 * @param recursive Whether to include transitive dependencies
 * @returns Array of dependency plugin IDs
 */
export function getPluginDependencies(
  plugin: Plugin,
  availablePlugins: Record<string, Plugin>,
  recursive = false,
): string[] {
  const dependencies = new Set<string>();

  // If no dependencies, return empty array
  if (!plugin.meta.dependencies?.length) {
    return [];
  }

  // Add direct dependencies
  for (const depId of plugin.meta.dependencies) {
    dependencies.add(depId);

    // Add transitive dependencies if recursive
    if (recursive && availablePlugins[depId]) {
      const transitiveDeps = getPluginDependencies(
        availablePlugins[depId],
        availablePlugins,
        true,
      );

      for (const id of transitiveDeps) {
        dependencies.add(id);
      }
    }
  }

  return [...dependencies];
}

/**
 * Get an array of plugin IDs that depend on a plugin
 *
 * @param pluginId ID of the plugin to check
 * @param availablePlugins Available plugins
 * @param recursive Whether to include plugins that depend on dependents
 * @returns Array of dependent plugin IDs
 */
export function getPluginDependents(
  pluginId: string,
  availablePlugins: Record<string, Plugin>,
  recursive = false,
): string[] {
  const dependents = new Set<string>();

  // Find all plugins that depend on this one
  for (const [id, plugin] of Object.entries(availablePlugins)) {
    if (plugin.meta.dependencies?.includes(pluginId)) {
      dependents.add(id);

      // Add plugins that depend on this dependent if recursive
      if (recursive) {
        const transitiveDeps = getPluginDependents(id, availablePlugins, true);

        for (const depId of transitiveDeps) {
          dependents.add(depId);
        }
      }
    }
  }

  return [...dependents];
}
