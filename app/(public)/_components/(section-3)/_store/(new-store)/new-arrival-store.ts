//app/(public)/_components/(section-3)/_store/(new-store)/new-arrival-store.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createNewArrival,
  getNewArrivals,
  getNewArrivalById,
} from "../../_actions/(new-arrivals-actions)/upload-get-actions";
import {
  updateNewArrival,
  deleteNewArrival,
} from "../../_actions/(new-arrivals-actions)/update-delete-actions";
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
  newArrivals: NewArrival[];
  isLoading: boolean;
  error: string | null;
  selectedNewArrival: NewArrival | null;
  lastFetched: number | null;

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
      newArrivals: [],
      isLoading: false,
      error: null,
      selectedNewArrival: null,
      lastFetched: null,

      fetchNewArrivals: async () => {
        const currentTime = Date.now();
        const lastFetched = get().lastFetched;
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

      fetchNewArrivalById: async (id: string) => {
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

      createNewArrival: async (formData: FormData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await createNewArrival(formData);
          if (response.success) {
            const currentNewArrivals = get().newArrivals;
            set({
              newArrivals: [...currentNewArrivals, response.data],
              selectedNewArrival: response.data,
              lastFetched: Date.now(),
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

      updateNewArrival: async (id, formData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await updateNewArrival(id, formData);
          if (response.success) {
            set((state) => ({
              newArrivals: state.newArrivals.map((n) =>
                n.id === id ? { ...n, ...response.data } : n
              ),
              selectedNewArrival: response.data,
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

      deleteNewArrival: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await deleteNewArrival(id);
          if (response.success) {
            set((state) => ({
              newArrivals: state.newArrivals.filter((n) => n.id !== id),
              selectedNewArrival: null,
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

      setSelectedNewArrival: (newArrival: NewArrival | null) => {
        set({ selectedNewArrival: newArrival });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "new-arrivals-storage",
      storage: isLocalStorageAvailable() ? createSecureStorage() : undefined,
      partialize: (state) => ({
        newArrivals: sanitizeProductData(state.newArrivals),
        lastFetched: state.lastFetched,
      }),
    },
  ),
);

export default useNewArrivalsStore;