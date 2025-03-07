// Component registration
export {
  registerPluginComponents,
  unregisterPluginComponents,
} from './components/register';

// I18n integration
export { registerPluginLocales, removePluginLocales } from './i18n/register';

// Router integration
export {
  getPluginRoutes,
  registerPluginRoutes,
  removePluginRoutes,
} from './router/register';

// Main setup function
export { setupPluginSystem } from './setup';

// Store
export { usePluginStore } from './store/plugin-store';
