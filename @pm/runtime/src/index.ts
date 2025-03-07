// Application
export { createPluginApplication } from './application/plugin-application';

// Component registration
export {
  registerPluginComponents,
  unregisterPluginComponents,
} from './components/register';

// Plugin config
export { PluginConfigManager, usePluginConfig } from './config/plugin-config';

// I18n integration
export { registerPluginLocales, removePluginLocales } from './i18n/register';

// Plugin loader
export { PluginSourceType } from './loader/plugin-loader';

// Router integration
export {
  getPluginRoutes,
  registerPluginRoutes,
  removePluginRoutes,
} from './router/register';

// Store
export { usePluginStore } from './store/plugin-store';
