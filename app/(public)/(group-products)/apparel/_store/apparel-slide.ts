//app/(public)/(group-products)/apparel/_store/apparel-slide.ts

import { create } from "zustand";
import { ApparelSlide, ApparelSlideResponse } from "../../types";
import { createApparelSlide } from "../_actions/create-read";
import { deleteApparelSlide, updateApparelSlide } from "../_actions/update-delete";

interface ApparelSlideState {
  slides: ApparelSlide[];
  isLoading: boolean;
  error: string | null;

  setSlides: (slides: ApparelSlide[]) => void;
  createSlide: (formData: FormData) => Promise<ApparelSlideResponse>;
  updateSlide: (formData: FormData) => Promise<ApparelSlideResponse>;
  deleteSlide: (id: string) => Promise<ApparelSlideResponse>;
  reset: () => void;
}

const initialState = {
  slides: [],
  isLoading: false,
  error: null,
};

const useApparelSlideStore = create<ApparelSlideState>((set, get) => ({
  ...initialState,

  setSlides: (slides) => {
    set({ slides });
    console.log("[useApparelSlideStore] setSlides: slides state updated", slides);
  },

  createSlide: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await createApparelSlide(formData);
      if (response.success && response.data) {
        set((state) => ({
          slides: [...state.slides, response.data!],
        }));
        console.log("[useApparelSlideStore] createSlide: slide created", response.data);
      }
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      set({ error: errorMessage });
      console.error("[useApparelSlideStore] createSlide error:", error);
      return { success: false, error: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },

  updateSlide: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const prevSlides = get().slides;
      const response = await updateApparelSlide(formData);

      if (response.success && response.data) {
        let updatedSlides = prevSlides.map((slide) =>
          slide.id === response.data!.id ? response.data! : slide
        );
        updatedSlides.sort((a, b) => a.order - b.order);
        set({ slides: updatedSlides });
        console.log("[useApparelSlideStore] updateSlide: slide updated", response.data);
      }
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      set({ error: errorMessage });
      console.error("[useApparelSlideStore] updateSlide error:", error);
      return { success: false, error: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },

  deleteSlide: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await deleteApparelSlide(id);
      if (response.success) {
        set((state) => ({
          slides: state.slides.filter((slide) => slide.id !== id),
        }));
        console.log("[useApparelSlideStore] deleteSlide: slide deleted", id);
      }
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      set({ error: errorMessage });
      console.error("[useApparelSlideStore] deleteSlide error:", error);
      return { success: false, error: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => {
    set(initialState);
    console.log("[useApparelSlideStore] reset: state reset to initial");
  },
}));

export default useApparelSlideStore;
