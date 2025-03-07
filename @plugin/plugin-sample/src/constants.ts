// Constants for the sample plugin

/**
 * Plugin ID
 */
export const PLUGIN_ID = 'sample';

/**
 * Plugin routes
 */
export const ROUTE_NAMES = {
  DETAIL: 'SampleDetail',
  LIST: 'SampleList',
  ROOT: 'SampleRoot',
};

/**
 * Status options
 */
export const STATUS_OPTIONS = [
  { label: 'sample.status.active', value: 'active' },
  { label: 'sample.status.inactive', value: 'inactive' },
  { label: 'sample.status.pending', value: 'pending' },
];

/**
 * Default pagination settings
 */
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100'];
