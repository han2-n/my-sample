import type { PluginContext } from '@vben/pm-core';

import { definePlugin } from '@vben/pm-core';

// Import components
import HelloWorld from './components/hello-world.vue';
// Import translations
import enUS from './locales/en-US';
import zhCN from './locales/zh-CN';
// Import views
import HelloWorldView from './views/hello-world-view.vue';

/**
 * Hello World Plugin
 * A simple demonstration plugin for Vue-Vben-Admin
 */
export default definePlugin(
  'hello-world', // Plugin ID
  {
    author: {
      email: 'your.email@example.com',
      name: 'Your Name',
    },
    dependencies: [], // No dependencies
    description: 'A simple Hello World plugin demonstrating the plugin system',
    enabled: true,
    name: 'Hello World',
    tags: ['demo', 'hello-world'],
    version: '1.0.0',
  },
  {
    /**
     * Activate function
     * Called when the plugin is activated
     */
    activate() {
      console.log('Hello World plugin activated');
      this.sayHello();
    },

    /**
     * Deactivate function
     * Called when the plugin is deactivated
     */
    deactivate() {
      console.log('Hello World plugin deactivated');
      this.sayGoodbye();
    },

    /**
     * Custom method to demonstrate plugin functionality
     */
    sayGoodbye() {
      console.log('Goodbye from Hello World plugin!');
    },

    /**
     * Custom method to demonstrate plugin functionality
     */
    sayHello() {
      console.log('Hello from Hello World plugin!');
    },

    /**
     * Setup function for the plugin
     * Called when the plugin is loaded
     */
    setup(context: PluginContext) {
      // Register components
      context.registerComponent('HelloWorld', HelloWorld);

      // Register routes
      context.registerRoute({
        component: HelloWorldView,
        meta: {
          icon: 'smile-outlined',
          orderNo: 1000,
          title: 'routes.helloWorld.title',
        },
        name: 'HelloWorld',
        path: '/hello-world',
      });

      // Register menu items
      context.registerMenuItem({
        icon: 'smile-outlined',
        name: 'menu.helloWorld',
        order: 100,
        path: '/hello-world',
      });

      // Register localizations
      context.registerLocale('en-US', enUS);
      context.registerLocale('zh-CN', zhCN);

      // Log setup completion
      context.log('info', 'Hello World plugin setup completed');
    },
  },
);
