//app/(public)/_components/(section-3)/_components/ProductCard.tsx

import React from "react";
import Image from "next/image";
import { Package, Star, Pencil, Trash2 } from "lucide-react";
import { ProductCardProps } from "../types";
import { useSession } from "@/app/SessionProvider";

// Additional props for ProductCard component
interface ExtendedProps {
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

// Combine ProductCardProps with ExtendedProps
type ExtendedProductCardProps = ProductCardProps & ExtendedProps;

const ProductCard: React.FC<ExtendedProductCardProps> = (props) => {
  const { user } = useSession();
  const isEditor = user?.role === "EDITOR" || user?.role === "SUPERADMIN";
  
  // Handle empty slots for editors
  if (props.isEmpty) {
    return (
      <div className="w-full sm:flex-1 p-4 bg-card/50 rounded-lg border border-dashed border-border flex justify-center items-center h-[250px]">
        <span className="text-muted-foreground">Empty slot</span>
      </div>
    );
  }

  const renderPrice = () => {
    if ("price" in props) {
      return (
        <span className="text-lg font-semibold text-primary">
          R{props.price}
        </span>
      );
    } else {
      return (
        <div className="flex items-center space-x-2">
          <span className="text-lg font-semibold text-red-600">
            R{props.salePrice}
          </span>
          <span className="text-sm text-muted-foreground line-through">
            R{props.originalPrice}
          </span>
        </div>
      );
    }
  };

  // Ensure we have a valid ID for all product types
  const productId = props.id || "";

  return (
    <div className="w-full sm:flex-1 p-4 bg-card rounded-lg border border-border hover:shadow-md transition-shadow relative">
      {isEditor && productId && (
        <div className="absolute top-2 right-2 flex gap-2 z-10">
          <button
            onClick={() => props.onEdit && productId && props.onEdit(productId)}
            className="p-3 bg-secondary rounded-full hover:bg-primary/10 transition-colors"
            aria-label="Edit product"
          >
            <Pencil className="w-4 h-4 text-primary" />
          </button>
          <button
            onClick={() => props.onDelete && productId && props.onDelete(productId)}
            className="p-3 bg-secondary rounded-full hover:bg-destructive/10 transition-colors"
            aria-label="Delete product"
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </button>
        </div>
      )}
      <div className="relative flex justify-center items-center h-48 bg-secondary rounded-md mb-4">
        {props.image ? (
          <Image
            src={props.image}
            alt={props.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover rounded-md"
            priority
          />
        ) : (
          <Package className="w-16 h-16 text-muted-foreground" />
        )}
      </div>
      <h3 className="text-card-foreground font-medium mb-2 line-clamp-1">
        {props.name}
      </h3>
      <div className="flex justify-between items-center mb-2">
        {renderPrice()}
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < props.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;