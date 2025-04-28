//app/(public)/(group-products)/all-collections/_store/all-collections-slide.ts

import { create } from "zustand";
import { AllCollectionsSlide, AllCollectionsSlideResponse } from "../../types";
import { createAllCollectionsSlide } from "../_actions/create-read";
import { deleteAllCollectionsSlide, updateAllCollectionsSlide } from "../_actions/update-delete";

interface AllCollectionsSlideState {
  slides: AllCollectionsSlide[];
  isLoading: boolean;
  error: string | null;

  setSlides: (slides: AllCollectionsSlide[]) => void;
  createSlide: (formData: FormData) => Promise<AllCollectionsSlideResponse>;
  updateSlide: (formData: FormData) => Promise<AllCollectionsSlideResponse>;
  deleteSlide: (id: string) => Promise<AllCollectionsSlideResponse>;
  reset: () => void;
}

const initialState = {
  slides: [],
  isLoading: false,
  error: null,
};

const useAllCollectionsSlideStore = create<AllCollectionsSlideState>((set, get) => ({
  ...initialState,

  setSlides: (slides) => {
    set({ slides });
    console.log("[useAllCollectionsSlideStore] setSlides: slides state updated", slides);
  },

  createSlide: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await createAllCollectionsSlide(formData);
      if (response.success && response.data) {
        set((state) => ({
          slides: [...state.slides, response.data!],
        }));
        console.log("[useAllCollectionsSlideStore] createSlide: slide created", response.data);
      }
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      set({ error: errorMessage });
      console.error("[useAllCollectionsSlideStore] createSlide error:", error);
      return { success: false, error: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },

  updateSlide: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const prevSlides = get().slides;
      const response = await updateAllCollectionsSlide(formData);

      if (response.success && response.data) {
        let updatedSlides = prevSlides.map((slide) =>
          slide.id === response.data!.id ? response.data! : slide
        );
        updatedSlides.sort((a, b) => a.order - b.order);
        set({ slides: updatedSlides });
        console.log("[useAllCollectionsSlideStore] updateSlide: slide updated", response.data);
      }
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      set({ error: errorMessage });
      console.error("[useAllCollectionsSlideStore] updateSlide error:", error);
      return { success: false, error: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },

  deleteSlide: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await deleteAllCollectionsSlide(id);
      if (response.success) {
        set((state) => ({
          slides: state.slides.filter((slide) => slide.id !== id),
        }));
        console.log("[useAllCollectionsSlideStore] deleteSlide: slide deleted", id);
      }
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      set({ error: errorMessage });
      console.error("[useAllCollectionsSlideStore] deleteSlide error:", error);
      return { success: false, error: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => {
    set(initialState);
    console.log("[useAllCollectionsSlideStore] reset: state reset to initial");
  },
}));

export default useAllCollectionsSlideStore;