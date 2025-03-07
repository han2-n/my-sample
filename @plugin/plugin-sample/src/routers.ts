// Sample plugin routes definition
import type { RouteRecordRaw } from 'vue-router';

import { SampleDetail, SamplePage } from './views';

/**
 * Plugin routes
 * These will be added to the vue-router instance
 */
export const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'carbon:chart-line-smooth',
      order: 500,
      permissions: ['sample.view'],
      roles: ['admin', 'user'],
      title: 'Sample Plugin',
    },
    name: 'SampleRoot',
    path: '/sample',
    redirect: '/sample/list',
    children: [
      {
        path: 'list',
        name: 'SampleList',
        component: SamplePage,
        meta: {
          icon: 'carbon:list',
          permissions: ['sample.view'],
          roles: ['admin', 'user'],
          title: 'Sample List',
        },
      },
      {
        path: 'detail/:id',
        name: 'SampleDetail',
        component: SampleDetail,
        meta: {
          activeMenu: 'SampleList',
          hideInMenu: true,
          permissions: ['sample.view'],
          roles: ['admin', 'user'],
          title: 'Sample Detail',
        },
      },
    ],
  },
];
