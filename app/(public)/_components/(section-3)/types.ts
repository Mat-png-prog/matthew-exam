//app/(public)/_components/(section-3)/types.ts

export interface BaseProductProps {
  id: string; // Required ID field
  name: string;
  rating: number;
  image?: string;
}

export interface RegularProductProps extends BaseProductProps {
  price: string;
  originalPrice?: never;
  salePrice?: never;
}

export interface SaleProductProps extends BaseProductProps {
  originalPrice: string;
  salePrice: string;
  price?: never;
}

export type ProductCardProps = RegularProductProps | SaleProductProps;

export interface ProductSlideProps {
  products: ProductCardProps[];
  isMobile: boolean;
  activeTab: number;
  tabName: string;
}

// Best seller specific interface from database
export interface BestSeller {
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

// Modal prop types
export interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  bestSellerId: string | null;
}

export interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  bestSellerId: string | null;
}

// Session types
export interface UserSession {
  user?: {
    role?: string;
  } | null;
}