"use client";

import { useEffect } from "react";
import ProductGrid from "../(unviresal_comp)/UnifiedProductGrid";
import { useProductsByPathname } from "../_components/_store/useProductsByPathname";

export default function ApparelProducts() {
  // Use the custom hook to get products filtered by pathname
  const { products, isLoading, error, apparelProducts } = useProductsByPathname();

  // Debug logging
  useEffect(() => {
    console.log("ApparelPage rendered:", {
      productsCount: products?.length || 0,
      apparelProductsCount: apparelProducts?.length || 0,
      isLoading,
      error,
    });
  }, [products, apparelProducts, isLoading, error]);

  // Handle loading state
  if (isLoading) {
    return <div className="text-center py-12">Loading products...</div>;
  }

  // Handle error state
  if (error) {
    console.error("Error loading apparel products:", error);
    return (
      <div className="text-center py-12 text-red-500">
        Error loading products: {error}
      </div>
    );
  }

  // Use apparelProducts specifically since we're on the apparel page
  // This ensures we only show products in the apparel category
  const safeProducts = Array.isArray(apparelProducts) ? apparelProducts : [];

  return (
    <div>
      {safeProducts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No apparel products found.
        </div>
      ) : (
        <ProductGrid products={safeProducts} enableLogging={true} />
      )}
    </div>
  );
}