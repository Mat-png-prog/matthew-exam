//app/(public)/_components/(section-3)/types.ts


export type TabContent = {
  [key: number]: ProductCardProps[][];
};

// Base product interface with common properties
export interface BaseProductProps {
  id: string;
  name: string;
  image: string;
  rating: number;
  isEmpty?: boolean;
}

// Interface for regular products (New Arrivals, Best Sellers)
export interface RegularProductProps extends BaseProductProps {
  price: number;
}

// Interface for sale products
export interface SaleProductProps extends BaseProductProps {
  originalPrice: number;
  salePrice: number;
}

// Union type for all product types
export type ProductCardProps = RegularProductProps | SaleProductProps | { isEmpty: true };

// Props for the ProductSlide component
export interface ProductSlideProps {
  products: ProductCardProps[];
  isMobile: boolean;
  activeTab: number;
  tabName: string;
}