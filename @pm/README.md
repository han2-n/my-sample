# Vue-Vben-Admin Plugin Management System

This package provides a comprehensive plugin management system for vue-vben-admin, inspired by NocoBase's plugin architecture but specifically tailored for the vue-vben-admin framework.

## Features

- 🔌 **Plugin Lifecycle Management**: Load, activate, and deactivate plugins dynamically
- 🛠️ **Dependency Resolution**: Automatically handle plugin dependencies
- 🧩 **Extensibility Points**: Register components, routes, store modules, and more
- 🌐 **I18n Support**: Register translations for multiple languages
- 🔑 **Permission Integration**: Seamless integration with vue-vben-admin's permission system
- 🖼️ **Admin UI**: Built-in admin interface for managing plugins
- 📦 **CLI Tools**: Create, build, and manage plugins from the command line

## Packages

This system consists of several packages:

- `@vben/pm-core`: Core plugin management functionality
- `@vben/pm-runtime`: Runtime integration with Vue, Vue Router, and i18n
- `@vben/pm-ui`: Admin UI components for managing plugins
- `@vben/pm-cli`: Command-line tools for plugin development

## Getting Started

### Installation

```bash
# Install the packages
pnpm add @vben/pm-core @vben/pm-runtime @vben/pm-ui
```

### Integration

1. Initialize the plugin system in your main.ts file:

```typescript
import { setupPluginSystem } from '@vben/pm-runtime';

async function initApplication() {
  // Create Vue app
  const app = createApp(App);

  // Set up Vue router
  app.use(router);

  // Set up i18n
  const i18n = await setupI18n(app);

  // Set up plugin system
  await setupPluginSystem(app, router, i18n, {
    storeDir: './plugins',
    autoActivate: true,
    resolveDependencies: true,
  });

  // Mount app
  app.mount('#app');
}
```

2. Add the plugin management UI to your routes:

```typescript
import { pluginRoutes } from '@vben/pm-ui';

const routes = [
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      ...pluginRoutes,
      // Other admin routes
    ],
  },
];
```

### Creating a Plugin

The easiest way to create a plugin is to use the CLI:

```bash
# Install the CLI
pnpm add -g @vben/pm-cli

# Create a new plugin
vben-pm create my-awesome-plugin
```

Or you can create a plugin manually:

1. Create a directory for your plugin:

```
plugins/
└── my-awesome-plugin/
    ├── components/
    │   └── AwesomeComponent.vue
    ├── views/
    │   └── AwesomePage.vue
    ├── index.ts
    ├── manifest.json
    └── routes.ts
```

2. Define your plugin manifest (manifest.json):

```json
{
  "id": "my-awesome-plugin",
  "name": "My Awesome Plugin",
  "description": "A sample plugin for vue-vben-admin",
  "version": "1.0.0",
  "author": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "entry": "./index.ts",
  "enabled": true,
  "dependencies": []
}
```

3. Implement your plugin entry point (index.ts):

```typescript
import type { PluginContext } from '@vben/pm-core';
import { AwesomeComponent } from './components';
import { routes } from './routes';

export function setup(context: PluginContext) {
  // Register components
  context.registerComponent('AwesomeComponent', AwesomeComponent);

  // Register routes
  for (const route of routes) {
    context.registerRoute(route);
  }

  // Register locales
  context.registerLocale('en-US', {
    awesomePlugin: {
      title: 'Awesome Plugin',
      description: 'This is an awesome plugin',
    },
  });

  context.log('info', 'My Awesome Plugin setup complete');
}

export function activate() {
  console.log('My Awesome Plugin activated');
}

export function deactivate() {
  console.log('My Awesome Plugin deactivated');
}
```

## Plugin Lifecycle

Plugins in this system have a defined lifecycle:

1. **Discovery**: Plugins are discovered in the plugins directory
2. **Loading**: Plugin manifests are loaded and validated
3. **Setup**: The `setup` function is called to register components, routes, etc.
4. **Activation**: The `activate` function is called when the plugin is activated
5. **Deactivation**: The `deactivate` function is called when the plugin is deactivated

## Plugin Context API

When your plugin's `setup` function is called, it receives a `PluginContext` object that provides various methods for interacting with the application:

```typescript
interface PluginContext {
  // Application instances
  app: App; // Vue application instance
  router: Router; // Vue Router instance
  store: Store; // Pinia store
  i18n: I18n; // i18n instance
  hooks: PluginHooks; // Plugin lifecycle hooks

  // Plugin methods
  getPlugin: (id: string) => PluginInstance | undefined; // Get a plugin by ID

  // Registration methods
  registerComponent: (name: string, component: Component) => void; // Register a component
  registerRoute: (route: RouteRecordRaw) => void; // Register a route
  registerMenuItem: (menuItem: any) => void; // Register a menu item
  registerStore: (namespace: string, storeModule: any) => void; // Register a store module
  registerLocale: (locale: string, messages: Record<string, any>) => void; // Register localization messages
  registerPermission: (permission: string, description?: string) => void; // Register a permission

  // Utility methods
  log: (
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    ...args: any[]
  ) => void; // Log a message
  getConfig: <T>(key: string, defaultValue?: T) => T; // Get configuration
  setConfig: <T>(key: string, value: T) => void; // Set configuration
}
```

## CLI Commands

The `@vben/pm-cli` package provides several commands for working with plugins:

- `vben-pm create [name]`: Create a new plugin
- `vben-pm build <plugin>`: Build a plugin for distribution
- `vben-pm enable <plugin-id>`: Enable a plugin
- `vben-pm disable <plugin-id>`: Disable a plugin
- `vben-pm list`: List all installed plugins

## API Reference

For a complete API reference, see the TypeScript definition files in each package.

## License

MIT
