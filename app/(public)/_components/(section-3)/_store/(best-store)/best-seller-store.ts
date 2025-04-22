//app/(public)/_components/(section-3)/_store/(best-store)/best-seller-store.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createBestSeller,
  getBestSeller,
  getBestSellerById,
} from "../../_actions/(best-seller-actions.ts)/upload-get-actions";
import {
  updateBestSeller,
  deleteBestSeller,
} from "../../_actions/(best-seller-actions.ts)/update-delete-actions";
import {
  createSecureStorage,
  isLocalStorageAvailable,
  sanitizeProductData,
} from "../secureStorage";

interface BestSeller {
  id: string;
  name: string;
  price: number;
  rating: number;
  imageUrl: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    displayName: string;
  };
}

interface BestSellerState {
  bestSellers: BestSeller[];
  isLoading: boolean;
  error: string | null;
  selectedBestSeller: BestSeller | null;
  lastFetched: number | null;

  fetchBestSellers: () => Promise<void>;
  fetchBestSellerById: (id: string) => Promise<void>;
  createBestSeller: (formData: FormData) => Promise<void>;
  updateBestSeller: (id: string, formData: FormData) => Promise<void>;
  deleteBestSeller: (id: string) => Promise<void>;
  setSelectedBestSeller: (bestSeller: BestSeller | null) => void;
  clearError: () => void;
}

const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000;

const useBestSellerStore = create<BestSellerState>()(
  persist(
    (set, get) => ({
      bestSellers: [],
      isLoading: false,
      error: null,
      selectedBestSeller: null,
      lastFetched: null,

      fetchBestSellers: async () => {
        const currentTime = Date.now();
        const lastFetched = get().lastFetched;
        if (!lastFetched || currentTime - lastFetched > CACHE_DURATION) {
          set({ isLoading: true, error: null });
          try {
            const response = await getBestSeller();
            if (response.success) {
              set({
                bestSellers: response.data,
                lastFetched: currentTime,
              });
            } else {
              set({ error: response.error || "Failed to fetch best sellers" });
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

      fetchBestSellerById: async (id: string) => {
        const existingItem = get().bestSellers.find((item) => item.id === id);
        if (existingItem) {
          set({ selectedBestSeller: existingItem });
          return;
        }
        set({ isLoading: true, error: null });
        try {
          const response = await getBestSellerById(id);
          if (response.success) {
            set({ selectedBestSeller: response.data });
          } else {
            set({ error: response.error || "Failed to fetch best seller" });
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

      createBestSeller: async (formData: FormData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await createBestSeller(formData);
          if (response.success) {
            const currentBestSellers = get().bestSellers;
            set({
              bestSellers: [...currentBestSellers, response.data],
              selectedBestSeller: response.data,
              lastFetched: Date.now(),
            });
          } else {
            set({ error: response.error || "Failed to create best seller" });
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

      updateBestSeller: async (id, formData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await updateBestSeller(id, formData);
          if (response.success) {
            set((state) => ({
              bestSellers: state.bestSellers.map((b) =>
                b.id === id ? { ...b, ...response.data } : b
              ),
              selectedBestSeller: response.data,
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

      deleteBestSeller: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await deleteBestSeller(id);
          if (response.success) {
            set((state) => ({
              bestSellers: state.bestSellers.filter((b) => b.id !== id),
              selectedBestSeller: null,
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

      setSelectedBestSeller: (bestSeller: BestSeller | null) => {
        set({ selectedBestSeller: bestSeller });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "best-seller-storage",
      storage: isLocalStorageAvailable() ? createSecureStorage() : undefined,
      partialize: (state) => ({
        bestSellers: sanitizeProductData(state.bestSellers),
        lastFetched: state.lastFetched,
      }),
    },
  ),
);

export default useBestSellerStore;