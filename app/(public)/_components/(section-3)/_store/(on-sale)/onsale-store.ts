//app/(public)/_components/(section-3)/_store/(on-sale)/onsale-store.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createOnSale,
  getOnSaleItems,
  getOnSaleItemById,
} from "../../_actions/(onsale-actions)/upload-get";
import {
  updateOnSaleItem as updateOnSaleItemAction,
  deleteOnSaleItem as deleteOnSaleItemAction,
} from "../../_actions/(onsale-actions)/update-delete";
import {
  createSecureStorage,
  isLocalStorageAvailable,
  sanitizeProductData,
} from "../secureStorage";

interface OnSaleItem {
  id: string;
  name: string;
  originalPrice: number;
  salePrice: number;
  rating: number;
  imageUrl: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    displayName: string;
  };
}

interface OnSaleState {
  // State
  onSaleItems: OnSaleItem[];
  isLoading: boolean;
  error: string | null;
  selectedOnSaleItem: OnSaleItem | null;
  lastFetched: number | null;

  // Actions
  fetchOnSaleItems: () => Promise<void>;
  fetchOnSaleItemById: (id: string) => Promise<void>;
  createOnSaleItem: (formData: FormData) => Promise<void>;
  updateOnSaleItem: (id: string, formData: FormData) => Promise<void>;
  deleteOnSaleItem: (id: string) => Promise<void>;
  setSelectedOnSaleItem: (onSaleItem: OnSaleItem | null) => void;
  clearError: () => void;
}

// Cache duration: 30 days in milliseconds
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000;

const useOnSaleStore = create<OnSaleState>()(
  persist(
    (set, get) => ({
      // Initial state
      onSaleItems: [],
      isLoading: false,
      error: null,
      selectedOnSaleItem: null,
      lastFetched: null,

      // Fetch all on sale items with caching
      fetchOnSaleItems: async () => {
        const currentTime = Date.now();
        const lastFetched = get().lastFetched;

        // Only fetch if no cache exists or cache has expired
        if (!lastFetched || currentTime - lastFetched > CACHE_DURATION) {
          set({ isLoading: true, error: null });
          try {
            const response = await getOnSaleItems();
            if (response.success) {
              set({
                onSaleItems: response.data,
                lastFetched: currentTime,
              });
            } else {
              set({ error: response.error || "Failed to fetch on sale items" });
            }
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : "An unexpected error occurred",
            });
          } finally {
            set({ isLoading: false });
          }
        }
      },

      // Fetch single on sale item by ID
      fetchOnSaleItemById: async (id: string) => {
        // Check if the item already exists in our cached data
        const existingItem = get().onSaleItems.find((item) => item.id === id);
        if (existingItem) {
          set({ selectedOnSaleItem: existingItem });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await getOnSaleItemById(id);
          if (response.success) {
            set({ selectedOnSaleItem: response.data });
          } else {
            set({ error: response.error || "Failed to fetch on sale item" });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "An unexpected error occurred",
          });
        } finally {
          set({ isLoading: false });
        }
      },

      // Create on sale item
      createOnSaleItem: async (formData: FormData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await createOnSale(formData);
          if (response.success) {
            // Update the onSaleItems list with the new item
            const currentOnSaleItems = get().onSaleItems;
            set({
              onSaleItems: [...currentOnSaleItems, response.data],
              selectedOnSaleItem: response.data,
              lastFetched: Date.now(), // Update last fetched timestamp
            });
          } else {
            set({ error: response.error || "Failed to create on sale item" });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "An unexpected error occurred",
          });
        } finally {
          set({ isLoading: false });
        }
      },

      // Update on sale item
      updateOnSaleItem: async (id: string, formData: FormData) => {
        set({ isLoading: true, error: null });
        try {
          console.log(`Updating on sale item with ID: ${id}`);
          const response = await updateOnSaleItemAction(id, formData);
          
          if (response.success) {
            // Update the item in the cached list
            const currentOnSaleItems = get().onSaleItems;
            const updatedOnSaleItems = currentOnSaleItems.map(item => 
              item.id === id ? response.data : item
            );
            
            set({
              onSaleItems: updatedOnSaleItems,
              selectedOnSaleItem: response.data,
              lastFetched: Date.now(), // Update last fetched timestamp
            });
            console.log(`Successfully updated on sale item: ${response.data.name}`);
          } else {
            set({ error: response.error || "Failed to update on sale item" });
            console.error(`Error updating on sale item: ${response.error}`);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
          console.error(`Exception updating on sale item: ${errorMessage}`);
          set({ error: errorMessage });
        } finally {
          set({ isLoading: false });
        }
      },

      // Delete on sale item
      deleteOnSaleItem: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          console.log(`Deleting on sale item with ID: ${id}`);
          const response = await deleteOnSaleItemAction(id);
          
          if (response.success) {
            // Remove the item from the cached list
            const currentOnSaleItems = get().onSaleItems;
            const updatedOnSaleItems = currentOnSaleItems.filter(item => item.id !== id);
            
            set({
              onSaleItems: updatedOnSaleItems,
              selectedOnSaleItem: null,
              lastFetched: Date.now(), // Update last fetched timestamp
            });
            console.log(`Successfully deleted on sale item ID: ${id}`);
          } else {
            set({ error: response.error || "Failed to delete on sale item" });
            console.error(`Error deleting on sale item: ${response.error}`);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
          console.error(`Exception deleting on sale item: ${errorMessage}`);
          set({ error: errorMessage });
        } finally {
          set({ isLoading: false });
        }
      },

      // Set selected on sale item
      setSelectedOnSaleItem: (onSaleItem: OnSaleItem | null) => {
        set({ selectedOnSaleItem: onSaleItem });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "on-sale-items-storage", // Name of the item in localStorage
      storage: isLocalStorageAvailable() ? createSecureStorage() : undefined,
      partialize: (state) => ({
        onSaleItems: sanitizeProductData(state.onSaleItems),
        lastFetched: state.lastFetched,
      }),
    },
  ),
);

export default useOnSaleStore;