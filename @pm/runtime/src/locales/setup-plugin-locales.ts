import type { I18n } from 'vue-i18n';

import type { PluginInstance } from '@vben/pm-core';

import { createLogger } from '@vben/pm-core';

const logger = createLogger({ level: 'info', prefix: '[PluginLocales]' });

// Define a structure to store plugin locale messages for later removal
interface PluginLocaleMessages {
  locale: string;
  messages: Record<string, any>;
  pluginId: string;
}

// Keep track of registered locale messages by plugin
const registeredLocaleMessages: PluginLocaleMessages[] = [];

/**
 * Setup plugin locales in vue-i18n
 * This will merge locale messages from all activated plugins
 */
export function setupPluginLocales(
  i18n: I18n,
  plugins: PluginInstance[],
): void {
  logger.info('Setting up plugin locales');

  // In vue-vben-admin, the localeMessages are not directly attached to plugin instances
  // Instead, we would typically need to load them from plugin files or API
  // For this example, we'll assume they're stored in a special property

  // Get activated plugins that might have locale messages
  const activatedPlugins = plugins.filter((plugin) => plugin.activated);

  if (activatedPlugins.length === 0) {
    logger.info('No plugins to setup locales from');
    return;
  }

  for (const plugin of activatedPlugins) {
    // Example: Load locale messages for this plugin
    const localeMessages = loadLocaleMessagesForPlugin(plugin);

    if (Object.keys(localeMessages).length === 0) {
      continue;
    }

    // Register locales for each supported language
    for (const [locale, messages] of Object.entries(localeMessages)) {
      logger.info(
        `Registering locale messages for plugin ${plugin.manifest.id}: ${locale}`,
      );

      // Merge messages into the i18n instance
      i18n.global.mergeLocaleMessage(locale, messages);

      // Store for later removal
      registeredLocaleMessages.push({
        locale,
        messages,
        pluginId: plugin.manifest.id,
      });
    }
  }

  logger.info('Plugin locales setup complete');
}

/**
 * Remove plugin locales from vue-i18n
 * This is a best-effort function as vue-i18n doesn't have direct support for removing messages
 */
export function removePluginLocales(
  i18n: I18n,
  plugins: PluginInstance[],
): void {
  logger.info('Removing plugin locales');
  logger.warn(
    'vue-i18n does not support removing locale messages. This is a best-effort operation.',
  );

  // Get plugins to remove locales for
  const pluginIds = new Set(plugins.map((plugin) => plugin.manifest.id));

  // Filter registered locale messages to those from the specified plugins
  const messagesToRemove = registeredLocaleMessages.filter((item) =>
    pluginIds.has(item.pluginId),
  );

  if (messagesToRemove.length === 0) {
    logger.info('No locale messages to remove');
    return;
  }

  // Log what would be removed
  for (const item of messagesToRemove) {
    logger.info(
      `Would remove locale messages for plugin ${item.pluginId}: ${item.locale}`,
    );

    // In a real implementation, we might try to deep remove the keys
    // But vue-i18n doesn't have direct support for this
  }

  // Remove from our tracking
  const remainingMessages = registeredLocaleMessages.filter(
    (item) => !pluginIds.has(item.pluginId),
  );

  // Update the array in place
  registeredLocaleMessages.length = 0;
  registeredLocaleMessages.push(...remainingMessages);

  logger.info('Plugin locales removal complete (best-effort)');
}

/**
 * Helper function to load locale messages for a plugin
 * In a real implementation, this would load from plugin files or API
 */
function loadLocaleMessagesForPlugin(
  plugin: PluginInstance,
): Record<string, Record<string, any>> {
  // Mock implementation - in real code, this would load from plugin files
  // For now, we'll check for a special property on the plugin
  const localeMessages = (plugin as any).localeMessages || {};
  return localeMessages;
}
