//app/(public)/_components/(section-3)/_store/(on-sale)/on-sale-store.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createOnSaleItem,
  getOnSaleItems,
  getOnSaleItemById,
} from "../../_actions/(on-sale-actions)/on-sale-actions";
import {
  updateOnSale,
  deleteOnSale,
} from "../../_actions/(on-sale-actions)/update-delete-actions";
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
  onSaleItems: OnSaleItem[];
  isLoading: boolean;
  error: string | null;
  selectedOnSaleItem: OnSaleItem | null;
  lastFetched: number | null;

  fetchOnSaleItems: () => Promise<void>;
  fetchOnSaleItemById: (id: string) => Promise<void>;
  createOnSaleItem: (formData: FormData) => Promise<void>;
  updateOnSale: (id: string, formData: FormData) => Promise<void>;
  deleteOnSale: (id: string) => Promise<void>;
  setSelectedOnSaleItem: (item: OnSaleItem | null) => void;
  clearError: () => void;
}

const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000;

const useOnSaleStore = create<OnSaleState>()(
  persist(
    (set, get) => ({
      onSaleItems: [],
      isLoading: false,
      error: null,
      selectedOnSaleItem: null,
      lastFetched: null,

      fetchOnSaleItems: async () => {
        const currentTime = Date.now();
        const lastFetched = get().lastFetched;
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

      fetchOnSaleItemById: async (id: string) => {
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

      createOnSaleItem: async (formData: FormData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await createOnSaleItem(formData);
          if (response.success) {
            const currentOnSaleItems = get().onSaleItems;
            set({
              onSaleItems: [...currentOnSaleItems, response.data],
              selectedOnSaleItem: response.data,
              lastFetched: Date.now(),
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

      updateOnSale: async (id, formData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await updateOnSale(id, formData);
          if (response.success) {
            set((state) => ({
              onSaleItems: state.onSaleItems.map((item) =>
                item.id === id ? { ...item, ...response.data } : item
              ),
              selectedOnSaleItem: response.data,
            }));
          } else {
            set({ error: response.error || "Failed to update" });
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Unexpected error" });
        } finally {
          set({ isLoading: false });
        }
      },

      deleteOnSale: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await deleteOnSale(id);
          if (response.success) {
            set((state) => ({
              onSaleItems: state.onSaleItems.filter((item) => item.id !== id),
              selectedOnSaleItem: null,
            }));
          } else {
            set({ error: response.error || "Failed to delete" });
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Unexpected error" });
        } finally {
          set({ isLoading: false });
        }
      },

      setSelectedOnSaleItem: (item: OnSaleItem | null) => {
        set({ selectedOnSaleItem: item });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "on-sale-storage",
      storage: isLocalStorageAvailable() ? createSecureStorage() : undefined,
      partialize: (state) => ({
        onSaleItems: sanitizeProductData(state.onSaleItems),
        lastFetched: state.lastFetched,
      }),
    },
  ),
);

export default useOnSaleStore;