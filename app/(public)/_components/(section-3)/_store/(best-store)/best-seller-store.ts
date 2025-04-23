//app/(public)/_components/(section-3)/_store/(best-store)/best-seller-store.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createBestSeller,
  getBestSeller,
  getBestSellerById,
} from "../../_actions/(best-seller-actions)/upload-get";
import {
  updateBestSeller as updateBestSellerAction,
  deleteBestSeller as deleteBestSellerAction,
} from "../../_actions/(best-seller-actions)/update-delete";
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
  // State
  bestSellers: BestSeller[];
  isLoading: boolean;
  error: string | null;
  selectedBestSeller: BestSeller | null;
  lastFetched: number | null;

  // Actions
  fetchBestSellers: () => Promise<void>;
  fetchBestSellerById: (id: string) => Promise<void>;
  createBestSeller: (formData: FormData) => Promise<void>;
  updateBestSeller: (id: string, formData: FormData) => Promise<void>;
  deleteBestSeller: (id: string) => Promise<void>;
  setSelectedBestSeller: (bestSeller: BestSeller | null) => void;
  clearError: () => void;
}

// Cache duration: 30 days in milliseconds
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000;

const useBestSellerStore = create<BestSellerState>()(
  persist(
    (set, get) => ({
      // Initial state
      bestSellers: [],
      isLoading: false,
      error: null,
      selectedBestSeller: null,
      lastFetched: null,

      // Fetch all best sellers with caching
      fetchBestSellers: async () => {
        const currentTime = Date.now();
        const lastFetched = get().lastFetched;

        // Only fetch if no cache exists or cache has expired
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

      // Fetch single best seller by ID
      fetchBestSellerById: async (id: string) => {
        // Check if the item already exists in our cached data
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

      // Create best seller
      createBestSeller: async (formData: FormData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await createBestSeller(formData);
          if (response.success) {
            // Update the bestSellers list with the new item
            const currentBestSellers = get().bestSellers;
            set({
              bestSellers: [...currentBestSellers, response.data],
              selectedBestSeller: response.data,
              lastFetched: Date.now(), // Update last fetched timestamp
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

      // Update best seller
      updateBestSeller: async (id: string, formData: FormData) => {
        set({ isLoading: true, error: null });
        try {
          console.log(`Updating best seller with ID: ${id}`);
          const response = await updateBestSellerAction(id, formData);
          
          if (response.success) {
            // Update the item in the cached list
            const currentBestSellers = get().bestSellers;
            const updatedBestSellers = currentBestSellers.map(item => 
              item.id === id ? response.data : item
            );
            
            set({
              bestSellers: updatedBestSellers,
              selectedBestSeller: response.data,
              lastFetched: Date.now(), // Update last fetched timestamp
            });
            console.log(`Successfully updated best seller: ${response.data.name}`);
          } else {
            set({ error: response.error || "Failed to update best seller" });
            console.error(`Error updating best seller: ${response.error}`);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
          console.error(`Exception updating best seller: ${errorMessage}`);
          set({ error: errorMessage });
        } finally {
          set({ isLoading: false });
        }
      },

      // Delete best seller
      deleteBestSeller: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          console.log(`Deleting best seller with ID: ${id}`);
          const response = await deleteBestSellerAction(id);
          
          if (response.success) {
            // Remove the item from the cached list
            const currentBestSellers = get().bestSellers;
            const updatedBestSellers = currentBestSellers.filter(item => item.id !== id);
            
            set({
              bestSellers: updatedBestSellers,
              selectedBestSeller: null,
              lastFetched: Date.now(), // Update last fetched timestamp
            });
            console.log(`Successfully deleted best seller ID: ${id}`);
          } else {
            set({ error: response.error || "Failed to delete best seller" });
            console.error(`Error deleting best seller: ${response.error}`);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
          console.error(`Exception deleting best seller: ${errorMessage}`);
          set({ error: errorMessage });
        } finally {
          set({ isLoading: false });
        }
      },

      // Set selected best seller
      setSelectedBestSeller: (bestSeller: BestSeller | null) => {
        set({ selectedBestSeller: bestSeller });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "best-sellers-storage", // Name of the item in localStorage
      storage: isLocalStorageAvailable() ? createSecureStorage() : undefined,
      partialize: (state) => ({
        bestSellers: sanitizeProductData(state.bestSellers),
        lastFetched: state.lastFetched,
      }),
    },
  ),
);

export default useBestSellerStore;