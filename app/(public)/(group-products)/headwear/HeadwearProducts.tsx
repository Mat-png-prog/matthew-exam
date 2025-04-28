//app/(public)/(group-products)/headwear/HeadwearProducts.tsx

"use client";

import { useEffect } from "react";
import ProductGrid from "../(unviresal_comp)/UnifiedProductGrid";
import { useProductsByPathname } from "../_components/_store/useProductsByPathname";



export default function HeadwearProductsClient() {
  // Use the custom hook to get products filtered by pathname
  const { products, isLoading, error, headwearProducts } = useProductsByPathname();

  // Debug logging
  useEffect(() => {
    console.log("HeadwearPage rendered:", {
      productsCount: products?.length || 0,
      headwearProductsCount: headwearProducts?.length || 0,
      isLoading,
      error,
    });
  }, [products, headwearProducts, isLoading, error]);

  // Handle loading state
  if (isLoading) {
    return <div className="text-center py-12">Loading products...</div>;
  }

  // Handle error state
  if (error) {
    console.error("Error loading headwear products:", error);
    return (
      <div className="text-center py-12 text-red-500">
        Error loading products: {error}
      </div>
    );
  }

  // Use headwearProducts specifically since we're on the headwear page
  // This ensures we only show products in the headwear category
  const safeProducts = Array.isArray(headwearProducts) ? headwearProducts : [];

  return (
    <div>
      {safeProducts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No headwear products found.
        </div>
      ) : (
        <ProductGrid products={safeProducts} enableLogging={true} />
      )}
    </div>
  );
}