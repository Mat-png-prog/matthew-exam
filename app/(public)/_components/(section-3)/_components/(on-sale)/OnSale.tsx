//app/(public)/_components/(section-3)/_components/(on-sale)/OnSale.tsx

import { useMemo, useEffect } from "react";
import { ProductCardProps, TabContent } from "../../types";
import { useSession } from "@/app/SessionProvider";
import useOnSaleStore from "../../_store/(on-sale)/onsale-store";

const SLOTS_PER_PAGE = {
  mobile: 2,
  desktop: 4,
};

export const useOnSaleContent = (): TabContent => {
  const { onSaleItems, fetchOnSaleItems, isLoading } = useOnSaleStore();
  const { user } = useSession();
  const isEditor = user?.role === "EDITOR" || user?.role === "SUPERADMIN";

  // Fetch data on mount
  useEffect(() => {
    fetchOnSaleItems();
  }, [fetchOnSaleItems]);

  return useMemo(() => {
    // Convert on-sale items to ProductCardProps format
    const convertedProducts: ProductCardProps[] = onSaleItems.map((item) => ({
      id: item.id, // Include the id property
      name: item.name,
      originalPrice: Number(item.originalPrice), // Keep as number
      salePrice: Number(item.salePrice), // Keep as number
      rating: item.rating,
      image: item.imageUrl,
    }));

    // Create mobile and desktop pages
    const mobilePages: ProductCardProps[][] = [];
    const desktopPages: ProductCardProps[][] = [];

    // Fill mobile pages (2 items per page)
    for (let i = 0; i < convertedProducts.length; i += SLOTS_PER_PAGE.mobile) {
      mobilePages.push(convertedProducts.slice(i, i + SLOTS_PER_PAGE.mobile));
    }

    // Fill desktop pages (4 items per page)
    for (let i = 0; i < convertedProducts.length; i += SLOTS_PER_PAGE.desktop) {
      desktopPages.push(convertedProducts.slice(i, i + SLOTS_PER_PAGE.desktop));
    }

    // Function to add empty slots for editors
    const addEmptySlots = (
      pages: ProductCardProps[][],
      slotsPerPage: number,
    ): ProductCardProps[][] => {
      // If not an editor or loading, return pages as is
      if (!isEditor || isLoading) {
        return pages.length > 0 ? pages : [[]];
      }

      if (pages.length === 0) {
        // Create a page with empty slots if no content
        return [Array(slotsPerPage).fill({ isEmpty: true })];
      }

      const lastPage = pages[pages.length - 1];
      const remainingSlots = slotsPerPage - (lastPage.length % slotsPerPage);

      if (remainingSlots < slotsPerPage) {
        // Fill remaining slots in the last page
        lastPage.push(...Array(remainingSlots).fill({ isEmpty: true }));
      }

      // Add a new page with empty slots if all pages are full
      if (lastPage.length === slotsPerPage) {
        pages.push(Array(slotsPerPage).fill({ isEmpty: true }));
      }

      return pages;
    };

    const content = {
      mobile: addEmptySlots([...mobilePages], SLOTS_PER_PAGE.mobile),
      desktop: addEmptySlots([...desktopPages], SLOTS_PER_PAGE.desktop),
    };

    return content;
  }, [onSaleItems, isEditor, isLoading]);
};

// On Sale component that uses the hook
const OnSale = () => {
  const content = useOnSaleContent();
  return content;
};

export { OnSale };
export const OnSaleContent = {}; // For backwards compatibility if needed