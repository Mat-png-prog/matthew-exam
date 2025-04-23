//app/(public)/_components/(section-3)/_components/(new-arrivals)/NewArrivals.tsx

import { useMemo, useEffect } from "react";
import useNewArrivalsStore from "../../_store/(new-in-store)/new-arrivals-store";
import { ProductCardProps } from "../../types";
import { useSession } from "@/app/SessionProvider";

const SLOTS_PER_PAGE = {
  mobile: 2,
  desktop: 4,
};

export const useNewArrivalsContent = () => {
  const { newArrivals, fetchNewArrivals } = useNewArrivalsStore();
  const { user } = useSession();
  const isEditor = user?.role === "EDITOR";

  // Fetch data on mount
  useEffect(() => {
    fetchNewArrivals();
  }, [fetchNewArrivals]);

  return useMemo(() => {
    // Convert NewArrivals to ProductCardProps with IDs
    const convertedArrivals: ProductCardProps[] = newArrivals.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price.toString(),
      rating: item.rating,
      image: item.imageUrl,
    }));

    // Create pages for mobile and desktop
    const mobilePages: ProductCardProps[][] = [];
    const desktopPages: ProductCardProps[][] = [];

    // Fill mobile pages (2 items per page)
    for (let i = 0; i < convertedArrivals.length; i += SLOTS_PER_PAGE.mobile) {
      mobilePages.push(convertedArrivals.slice(i, i + SLOTS_PER_PAGE.mobile));
    }

    // Fill desktop pages (4 items per page)
    for (let i = 0; i < convertedArrivals.length; i += SLOTS_PER_PAGE.desktop) {
      desktopPages.push(convertedArrivals.slice(i, i + SLOTS_PER_PAGE.desktop));
    }

    // Add empty slots if needed (only for editors)
    const addEmptySlots = (
      pages: ProductCardProps[][],
      slotsPerPage: number,
    ) => {
      // If not an editor, return pages as is
      if (!isEditor) {
        return pages.length > 0 ? pages : [[]];
      }

      if (pages.length === 0) {
        // If no items, create a page with all empty slots
        return [Array(slotsPerPage).fill({ isEmpty: true, name: "", rating: 0 })];
      }

      const lastPage = pages[pages.length - 1];
      const remainingSlots = slotsPerPage - (lastPage.length % slotsPerPage);

      if (remainingSlots < slotsPerPage) {
        // Fill remaining slots in last page
        const emptySlots = Array(remainingSlots).fill({ isEmpty: true, name: "", rating: 0 });
        lastPage.push(...emptySlots);
      }

      // Add a new page with empty slots if all pages are full
      if (lastPage.length === slotsPerPage) {
        pages.push(Array(slotsPerPage).fill({ isEmpty: true, name: "", rating: 0 }));
      }

      return pages;
    };

    return {
      mobile: addEmptySlots(mobilePages, SLOTS_PER_PAGE.mobile),
      desktop: addEmptySlots(desktopPages, SLOTS_PER_PAGE.desktop),
    };
  }, [newArrivals, isEditor]);
};