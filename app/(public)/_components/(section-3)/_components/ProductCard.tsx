//app/(public)/_components/(section-3)/_components/ProductCard.tsx

import React, { useState } from "react";
import { Pencil, Trash2, Star } from "lucide-react";
import { useSession } from "@/app/SessionProvider";
import { BestSellerEditModal } from "./(best-seller)/BestSellerEditModal";
import { BestSellerDeleteModal } from "./(best-seller)/BestSellerDeleteModal";
import Image from "next/image";
import { ProductCardProps, UserSession } from "../types";

export const ProductCardWithActions: React.FC<ProductCardProps> = (props) => {
  const { user } = useSession() as UserSession;
  const isEditor = user?.role === "EDITOR";
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  console.log(`[ProductCard] Rendering product card: ${props.name} (${props.id})`);

  const renderPriceSection = () => {
    if ('price' in props) {
      return <div className="text-lg font-bold">${props.price}</div>;
    } else if ('originalPrice' in props && 'salePrice' in props) {
      return (
        <div className="flex items-center gap-2">
          <div className="text-lg text-primary font-bold">${props.salePrice}</div>
          <div className="text-sm text-muted-foreground line-through">${props.originalPrice}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative bg-card rounded-lg shadow p-4 group">
      {/* Product Image */}
      <div className="mb-4 aspect-square bg-secondary/20 rounded overflow-hidden">
        {props.image ? (
          <div className="relative w-full h-full">
            <Image
              src={props.image} 
              alt={props.name} 
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover"
              onError={(e) => {
                console.error(`[ProductCard] Image error for ${props.name}`);
                (e.target as HTMLImageElement).src = "/placeholder-product.jpg";
              }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No Image
          </div>
        )}
      </div>
      
      {/* Product Content */}
      <div>
        <h3 className="font-medium text-foreground mb-1">{props.name}</h3>
        
        {/* Rating stars */}
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, idx) => (
            <Star
              key={idx}
              className={`w-4 h-4 ${
                idx < props.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }`}
            />
          ))}
        </div>
        
        {/* Price section */}
        {renderPriceSection()}
      </div>

      {/* Edit/Delete buttons for editors */}
      {isEditor && (
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditOpen(true)}
            className="p-1 rounded hover:bg-secondary"
            aria-label="Edit"
          >
            <Pencil className="w-4 h-4 text-primary" />
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="p-1 rounded hover:bg-destructive/10"
            aria-label="Delete"
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </button>
        </div>
      )}

      {/* Modals */}
      <BestSellerEditModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        bestSellerId={props.id}
      />
      <BestSellerDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        bestSellerId={props.id}
      />
    </div>
  );
};