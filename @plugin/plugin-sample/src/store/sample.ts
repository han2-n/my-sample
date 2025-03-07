import type { SampleItem } from '../types';

import { computed, ref } from 'vue';

// Sample store module
import { defineStore } from 'pinia';

// This would normally use an API client to fetch data
// For demo purposes, we'll use mock data

// Mock data
const mockItems: SampleItem[] = [
  {
    createdAt: new Date('2023-01-01').toISOString(),
    description: 'This is a sample item for demonstration purposes.',
    id: '1',
    status: 'active',
    tags: ['demo', 'example'],
    title: 'Sample Item 1',
    updatedAt: new Date('2023-01-02').toISOString(),
  },
  {
    createdAt: new Date('2023-02-01').toISOString(),
    description: 'Another sample item with different status.',
    id: '2',
    status: 'inactive',
    tags: ['test'],
    title: 'Sample Item 2',
    updatedAt: new Date('2023-02-02').toISOString(),
  },
  {
    createdAt: new Date('2023-03-01').toISOString(),
    description: 'A pending item that needs review.',
    id: '3',
    status: 'pending',
    tags: ['review', 'pending'],
    title: 'Sample Item 3',
    updatedAt: new Date('2023-03-02').toISOString(),
  },
];

// Generate a unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/**
 * Sample store for managing sample items
 */
export const useSampleStore = defineStore('sample', () => {
  // State
  const items = ref<SampleItem[]>([...mockItems]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  // Getters
  const activeItems = computed(() =>
    items.value.filter((item) => item.status === 'active'),
  );
  const inactiveItems = computed(() =>
    items.value.filter((item) => item.status === 'inactive'),
  );
  const pendingItems = computed(() =>
    items.value.filter((item) => item.status === 'pending'),
  );

  // Actions
  /**
   * Fetch all items
   */
  async function fetchItems(): Promise<SampleItem[]> {
    loading.value = true;
    error.value = null;

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // In a real implementation, this would be an API call
      // const response = await apiClient.get('/sample-items');
      // items.value = response.data;

      return items.value;
    } catch (error_) {
      error.value =
        error_ instanceof Error ? error_ : new Error(String(error_));
      throw error.value;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get a single item by ID
   */
  async function getItem(id: string): Promise<null | SampleItem> {
    loading.value = true;
    error.value = null;

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      // In a real implementation, this would be an API call
      // const response = await apiClient.get(`/sample-items/${id}`);
      // return response.data;

      const item = items.value.find((item) => item.id === id) || null;
      return item;
    } catch (error_) {
      error.value =
        error_ instanceof Error ? error_ : new Error(String(error_));
      throw error.value;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Create a new item
   */
  async function createItem(
    item: Omit<SampleItem, 'createdAt' | 'id' | 'updatedAt'>,
  ): Promise<SampleItem> {
    loading.value = true;
    error.value = null;

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // In a real implementation, this would be an API call
      // const response = await apiClient.post('/sample-items', item);
      // const newItem = response.data;

      const now = new Date().toISOString();
      const newItem: SampleItem = {
        ...item,
        createdAt: now,
        id: generateId(),
        updatedAt: now,
      };

      items.value.push(newItem);
      return newItem;
    } catch (error_) {
      error.value =
        error_ instanceof Error ? error_ : new Error(String(error_));
      throw error.value;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Update an existing item
   */
  async function updateItem(
    id: string,
    updates: Partial<SampleItem>,
  ): Promise<SampleItem> {
    loading.value = true;
    error.value = null;

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // In a real implementation, this would be an API call
      // const response = await apiClient.put(`/sample-items/${id}`, updates);
      // return response.data;

      const index = items.value.findIndex((item) => item.id === id);

      if (index === -1) {
        throw new Error(`Item with ID ${id} not found`);
      }

      const updatedItem: SampleItem = {
        ...items.value[index],
        ...updates,
        id, // Ensure ID doesn't change
        updatedAt: new Date().toISOString(),
      };

      items.value[index] = updatedItem;
      return updatedItem;
    } catch (error_) {
      error.value =
        error_ instanceof Error ? error_ : new Error(String(error_));
      throw error.value;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Delete an item
   */
  async function deleteItem(id: string): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // In a real implementation, this would be an API call
      // await apiClient.delete(`/sample-items/${id}`);

      const index = items.value.findIndex((item) => item.id === id);

      if (index === -1) {
        throw new Error(`Item with ID ${id} not found`);
      }

      items.value.splice(index, 1);
    } catch (error_) {
      error.value =
        error_ instanceof Error ? error_ : new Error(String(error_));
      throw error.value;
    } finally {
      loading.value = false;
    }
  }

  return {
    // Getters
    activeItems,
    createItem,
    deleteItem,

    error,
    // Actions
    fetchItems,
    getItem,

    inactiveItems,
    loading,
    pendingItems,
    updateItem,
    // State
    items,
  };
});
