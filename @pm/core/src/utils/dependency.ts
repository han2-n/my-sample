import type { PluginInstance } from '../types/plugin';

/**
 * Resolve plugin dependencies
 * @param plugins Map of available plugins
 * @param targetPlugin Plugin to resolve dependencies for
 * @param strictDependencies Whether to fail if a dependency cannot be found
 * @returns Ordered list of plugins that should be activated before the target plugin
 */
export function resolvePluginDependencies(
  plugins: Record<string, PluginInstance>,
  targetPlugin: PluginInstance,
  strictDependencies = false,
): PluginInstance[] {
  const result: PluginInstance[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(plugin: PluginInstance) {
    const { id } = plugin.manifest;

    // If already processed, skip
    if (visited.has(id)) {
      return;
    }

    // Detect circular dependencies
    if (visiting.has(id)) {
      throw new Error(`Circular dependency detected: ${id}`);
    }

    visiting.add(id);

    // Process dependencies
    const dependencies = plugin.manifest.dependencies || [];
    for (const depId of dependencies) {
      const depPlugin = plugins[depId];

      if (!depPlugin) {
        if (strictDependencies) {
          throw new Error(
            `Plugin dependency not found: ${depId} (required by ${id})`,
          );
        } else {
          continue;
        }
      }

      visit(depPlugin);
    }

    visiting.delete(id);
    visited.add(id);

    // Add to result
    result.push(plugin);
  }

  visit(targetPlugin);

  // Remove the target plugin itself
  return result.slice(0, -1);
}

/**
 * Sort plugins by dependency order
 * @param plugins List of plugins to sort
 * @param strictDependencies Whether to fail if a dependency cannot be found
 * @returns Sorted list of plugins
 */
export function sortPluginsByDependencies(
  plugins: Record<string, PluginInstance>,
  strictDependencies = false,
): PluginInstance[] {
  const result: PluginInstance[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  // Visit all plugins
  for (const [id, plugin] of Object.entries(plugins)) {
    if (!visited.has(id)) {
      visitPlugin(plugin);
    }
  }

  function visitPlugin(plugin: PluginInstance) {
    const { id } = plugin.manifest;

    // If already processed, skip
    if (visited.has(id)) {
      return;
    }

    // Detect circular dependencies
    if (visiting.has(id)) {
      throw new Error(`Circular dependency detected: ${id}`);
    }

    visiting.add(id);

    // Process dependencies
    const dependencies = plugin.manifest.dependencies || [];
    for (const depId of dependencies) {
      const depPlugin = plugins[depId];

      if (!depPlugin) {
        if (strictDependencies) {
          throw new Error(
            `Plugin dependency not found: ${depId} (required by ${id})`,
          );
        } else {
          continue;
        }
      }

      visitPlugin(depPlugin);
    }

    visiting.delete(id);
    visited.add(id);

    // Add to result
    result.push(plugin);
  }

  return result;
}
