// Type definitions for the sample plugin

/**
 * Sample item status type
 */
export type SampleStatus = 'active' | 'inactive' | 'pending';

/**
 * Sample item interface
 */
export interface SampleItem {
  /** Creation timestamp */
  createdAt: string;

  /** Item description */
  description: string;

  /** Unique identifier */
  id: string;

  /** Item status */
  status: SampleStatus;

  /** Item tags */
  tags?: string[];

  /** Item title */
  title: string;

  /** Last update timestamp */
  updatedAt: string;
}
