import React from "react";
import { ProductCardWithActions } from "./ProductCard";
import { ProductCardProps, ProductSlideProps } from "../types";

export const ProductSlide: React.FC<ProductSlideProps> = ({
  products,
  isMobile,
  activeTab,
  tabName,
}) => {
  console.log(`[ProductSlide] Rendering ${products.length} products for tab: ${tabName}`);
  
  // Calculate grid columns based on viewport
  const gridCols = isMobile 
    ? "grid-cols-1 sm:grid-cols-2" 
    : "grid-cols-1 sm:grid-cols-2 md:grid-cols-4";

  return (
    <div className={`grid ${gridCols} gap-6`}>
      {products.length > 0 ? (
        products.map((product: ProductCardProps, idx: number) => (
          <ProductCardWithActions 
            key={product.id || `product-${idx}`} 
            {...product}
          />
        ))
      ) : (
        // Empty state
        Array(isMobile ? 2 : 4).fill(0).map((_, idx: number) => (
          <div 
            key={`empty-${idx}`}
            className="border border-dashed border-border rounded-lg h-52 flex items-center justify-center text-muted-foreground"
          >
            No products to display
          </div>
        ))
      )}
    </div>
  );
}