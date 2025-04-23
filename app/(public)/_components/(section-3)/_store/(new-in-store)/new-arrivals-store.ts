//app/(public)/_components/(section-3)/_store/(new-in-store)/new-arrivals-store.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createNewArrival,
  getNewArrivals,
  getNewArrivalById,
} from "../../_actions/(new-arrivals-actions)/upload-get";
import {
  updateNewArrival as updateNewArrivalAction,
  deleteNewArrival as deleteNewArrivalAction,
} from "../../_actions/(new-arrivals-actions)/update-delete";
import {
  createSecureStorage,
  isLocalStorageAvailable,
  sanitizeProductData,
} from "../secureStorage";

interface NewArrival {
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

interface NewArrivalsState {
  // State
  newArrivals: NewArrival[];
  isLoading: boolean;
  error: string | null;
  selectedNewArrival: NewArrival | null;
  lastFetched: number | null;

  // Actions
  fetchNewArrivals: () => Promise<void>;
  fetchNewArrivalById: (id: string) => Promise<void>;
  createNewArrival: (formData: FormData) => Promise<void>;
  updateNewArrival: (id: string, formData: FormData) => Promise<void>;
  deleteNewArrival: (id: string) => Promise<void>;
  setSelectedNewArrival: (newArrival: NewArrival | null) => void;
  clearError: () => void;
}

// Cache duration: 30 days in milliseconds
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000;

const useNewArrivalsStore = create<NewArrivalsState>()(
  persist(
    (set, get) => ({
      // Initial state
      newArrivals: [],
      isLoading: false,
      error: null,
      selectedNewArrival: null,
      lastFetched: null,

      // Fetch all new arrivals with caching
      fetchNewArrivals: async () => {
        const currentTime = Date.now();
        const lastFetched = get().lastFetched;

        // Only fetch if no cache exists or cache has expired
        if (!lastFetched || currentTime - lastFetched > CACHE_DURATION) {
          set({ isLoading: true, error: null });
          try {
            const response = await getNewArrivals();
            if (response.success) {
              set({
                newArrivals: response.data,
                lastFetched: currentTime,
              });
            } else {
              set({ error: response.error || "Failed to fetch new arrivals" });
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

      // Fetch single new arrival by ID
      fetchNewArrivalById: async (id: string) => {
        // Check if the item already exists in our cached data
        const existingItem = get().newArrivals.find((item) => item.id === id);
        if (existingItem) {
          set({ selectedNewArrival: existingItem });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await getNewArrivalById(id);
          if (response.success) {
            set({ selectedNewArrival: response.data });
          } else {
            set({ error: response.error || "Failed to fetch new arrival" });
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

      // Create new arrival
      createNewArrival: async (formData: FormData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await createNewArrival(formData);
          if (response.success) {
            // Update the newArrivals list with the new item
            const currentNewArrivals = get().newArrivals;
            set({
              newArrivals: [...currentNewArrivals, response.data],
              selectedNewArrival: response.data,
              lastFetched: Date.now(), // Update last fetched timestamp
            });
          } else {
            set({ error: response.error || "Failed to create new arrival" });
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

      // Update new arrival
      updateNewArrival: async (id: string, formData: FormData) => {
        set({ isLoading: true, error: null });
        try {
          console.log(`Updating new arrival with ID: ${id}`);
          const response = await updateNewArrivalAction(id, formData);
          
          if (response.success) {
            // Update the item in the cached list
            const currentNewArrivals = get().newArrivals;
            const updatedNewArrivals = currentNewArrivals.map(item => 
              item.id === id ? response.data : item
            );
            
            set({
              newArrivals: updatedNewArrivals,
              selectedNewArrival: response.data,
              lastFetched: Date.now(), // Update last fetched timestamp
            });
            console.log(`Successfully updated new arrival: ${response.data.name}`);
          } else {
            set({ error: response.error || "Failed to update new arrival" });
            console.error(`Error updating new arrival: ${response.error}`);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
          console.error(`Exception updating new arrival: ${errorMessage}`);
          set({ error: errorMessage });
        } finally {
          set({ isLoading: false });
        }
      },

      // Delete new arrival
      deleteNewArrival: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          console.log(`Deleting new arrival with ID: ${id}`);
          const response = await deleteNewArrivalAction(id);
          
          if (response.success) {
            // Remove the item from the cached list
            const currentNewArrivals = get().newArrivals;
            const updatedNewArrivals = currentNewArrivals.filter(item => item.id !== id);
            
            set({
              newArrivals: updatedNewArrivals,
              selectedNewArrival: null,
              lastFetched: Date.now(), // Update last fetched timestamp
            });
            console.log(`Successfully deleted new arrival ID: ${id}`);
          } else {
            set({ error: response.error || "Failed to delete new arrival" });
            console.error(`Error deleting new arrival: ${response.error}`);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
          console.error(`Exception deleting new arrival: ${errorMessage}`);
          set({ error: errorMessage });
        } finally {
          set({ isLoading: false });
        }
      },

      // Set selected new arrival
      setSelectedNewArrival: (newArrival: NewArrival | null) => {
        set({ selectedNewArrival: newArrival });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "new-arrivals-storage", // Name of the item in localStorage
      storage: isLocalStorageAvailable() ? createSecureStorage() : undefined,
      partialize: (state) => ({
        newArrivals: sanitizeProductData(state.newArrivals),
        lastFetched: state.lastFetched,
      }),
    },
  ),
);

export default useNewArrivalsStore;