//app/(public)/(group-products)/headwear/_store/headwear-slide.ts

import { create } from "zustand";
import { HeadwearSlide, HeadwearSlideResponse } from "../../types";
import { createHeadwearSlide } from "../_actions/create-read";
import { deleteHeadwearSlide, updateHeadwearSlide } from "../_actions/update-delete";

interface HeadwearSlideState {
  slides: HeadwearSlide[];
  isLoading: boolean;
  error: string | null;

  setSlides: (slides: HeadwearSlide[]) => void;
  createSlide: (formData: FormData) => Promise<HeadwearSlideResponse>;
  updateSlide: (formData: FormData) => Promise<HeadwearSlideResponse>;
  deleteSlide: (id: string) => Promise<HeadwearSlideResponse>;
  reset: () => void;
}

const initialState = {
  slides: [],
  isLoading: false,
  error: null,
};

const useHeadwearSlideStore = create<HeadwearSlideState>((set, get) => ({
  ...initialState,

  setSlides: (slides) => {
    set({ slides });
    console.log("[useHeadwearSlideStore] setSlides: slides state updated", slides);
  },

  createSlide: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await createHeadwearSlide(formData);
      if (response.success && response.data) {
        set((state) => ({
          slides: [...state.slides, response.data!],
        }));
        console.log("[useHeadwearSlideStore] createSlide: slide created", response.data);
      }
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      set({ error: errorMessage });
      console.error("[useHeadwearSlideStore] createSlide error:", error);
      return { success: false, error: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },

  updateSlide: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const prevSlides = get().slides;
      const response = await updateHeadwearSlide(formData);

      if (response.success && response.data) {
        let updatedSlides = prevSlides.map((slide) =>
          slide.id === response.data!.id ? response.data! : slide
        );
        updatedSlides.sort((a, b) => a.order - b.order);
        set({ slides: updatedSlides });
        console.log("[useHeadwearSlideStore] updateSlide: slide updated", response.data);
      }
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      set({ error: errorMessage });
      console.error("[useHeadwearSlideStore] updateSlide error:", error);
      return { success: false, error: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },

  deleteSlide: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await deleteHeadwearSlide(id);
      if (response.success) {
        set((state) => ({
          slides: state.slides.filter((slide) => slide.id !== id),
        }));
        console.log("[useHeadwearSlideStore] deleteSlide: slide deleted", id);
      }
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      set({ error: errorMessage });
      console.error("[useHeadwearSlideStore] deleteSlide error:", error);
      return { success: false, error: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => {
    set(initialState);
    console.log("[useHeadwearSlideStore] reset: state reset to initial");
  },
}));

export default useHeadwearSlideStore;