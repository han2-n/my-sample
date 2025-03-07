// Export component utilities
export {
  registerPluginComponents,
  unregisterPluginComponents,
} from './components/register-components';

// Export locale utilities
export {
  removePluginLocales,
  setupPluginLocales,
} from './locales/setup-plugin-locales';

// Export router utilities
export {
  getPluginRoutes,
  removePluginRoutes,
  setupPluginRoutes,
} from './router/setup-plugin-routes';

// Export the setup function
export { setupPluginSystem } from './setup';

// packages/@pm/runtime/src/index.ts
// Export store
export { usePluginStore } from './store/plugin';
