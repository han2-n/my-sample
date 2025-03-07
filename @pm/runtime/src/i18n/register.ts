import type { I18n } from 'vue-i18n';

import type { Plugin } from '@vben/pm-core';

import { createLogger } from '@vben/pm-core';

const logger = createLogger({ level: 'info', prefix: '[I18n Registration]' });

// Keep track of locale messages by plugin
interface PluginLocaleMessage {
  locale: string;
  messages: Record<string, any>;
  pluginId: string;
}

// Store of registered locale messages
const registeredMessages: PluginLocaleMessage[] = [];

/**
 * Register i18n messages from plugins
 *
 * @param i18n Vue I18n instance
 * @param plugins Array of active plugins
 */
export function registerPluginLocales(i18n: I18n, plugins: Plugin[]): void {
  logger.info('Registering plugin locales');

  // Filter active plugins
  const activePlugins = plugins.filter((plugin) => plugin.status.active);

  if (activePlugins.length === 0) {
    logger.info('No active plugins for locale registration');
    return;
  }

  // In a real implementation, we'd need a way to load or access
  // the locale messages defined by each plugin.
  // For now, we'll just use a simple approach with a dummy function
  for (const plugin of activePlugins) {
    const localeMessages = getPluginLocaleMessages(plugin);

    if (Object.keys(localeMessages).length === 0) {
      continue;
    }

    // Register messages for each locale
    for (const [locale, messages] of Object.entries(localeMessages)) {
      logger.info(
        `Registering locale messages for plugin ${plugin.meta.id}: ${locale}`,
      );

      // Merge messages into i18n
      i18n.global.mergeLocaleMessage(locale, messages);

      // Store for later removal
      registeredMessages.push({
        locale,
        messages,
        pluginId: plugin.meta.id,
      });
    }
  }

  logger.info('Locale registration complete');
}

/**
 * Remove i18n messages from plugins
 * Note: vue-i18n doesn't have a clean way to remove messages,
 * so this is a best-effort implementation
 *
 * @param i18n Vue I18n instance
 * @param plugins Array of plugins to remove messages from
 */
export function removePluginLocales(i18n: I18n, plugins: Plugin[]): void {
  logger.warn(
    'Vue I18n does not directly support removing messages - best effort implementation',
  );

  // Get plugin IDs to remove
  const pluginIds = new Set(plugins.map((plugin) => plugin.meta.id));

  // Find messages to remove
  const messagesToRemove = registeredMessages.filter((msg) =>
    pluginIds.has(msg.pluginId),
  );

  if (messagesToRemove.length === 0) {
    logger.info('No locale messages to remove');
    return;
  }

  // Log what would be removed (actual removal is complex)
  for (const msg of messagesToRemove) {
    logger.info(
      `Removing locale messages for plugin ${msg.pluginId}: ${msg.locale}`,
    );
  }

  // Update our tracking
  const remainingMessages = registeredMessages.filter(
    (msg) => !pluginIds.has(msg.pluginId),
  );

  registeredMessages.length = 0;
  registeredMessages.push(...remainingMessages);

  logger.info('Locale removal complete (best effort)');
}

/**
 * Helper to get locale messages from a plugin
 * In a real implementation, this would load from files or plugin config
 */
function getPluginLocaleMessages(
  plugin: Plugin,
): Record<string, Record<string, any>> {
  // This is a placeholder - in a real implementation, you'd need
  // to define a way to access locale messages from plugins

  // For now, we'll assume the plugin has a localeMessages property in its metadata
  return (plugin.meta as any).localeMessages || {};
}
