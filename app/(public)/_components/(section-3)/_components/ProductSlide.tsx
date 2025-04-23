//app/(public)/_components/(section-3)/_components/ProductSlide.tsx

import React, { useState } from "react";
import ProductCard from "./ProductCard";
import { UploadModal } from "./(new-arrivals)/UploadModal";
import { EditModal } from "./(new-arrivals)/EditModal";
import { BestSellerUploadModal } from "./(best-seller)/BestSellerUploadModal";
import { EmptySlotCard } from "./EmptySlotCard";
import { ProductSlideProps } from "../types";
import { OnSaleUploadModal } from "./(on-sale)/OnSaleModal";
import useNewArrivalsStore from "../_store/(new-in-store)/new-arrivals-store";
import { useSession } from "@/app/SessionProvider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const ProductSlide: React.FC<ProductSlideProps> = ({
  products,
  isMobile,
  activeTab,
  tabName,
}) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  
  const { user } = useSession();
  const isEditor = user?.role === "EDITOR";
  const { deleteNewArrival } = useNewArrivalsStore();

  if (!products || products.length === 0) {
    return null;
  }

  const displayProducts = isMobile ? products.slice(0, 2) : products;

  const handleEditClick = (id: string) => {
    setSelectedProductId(id);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedProductId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedProductId) {
      if (activeTab === 0) {
        await deleteNewArrival(selectedProductId);
      }
      // Implement for other tabs when needed
      
      setIsDeleteDialogOpen(false);
      setSelectedProductId(null);
    }
  };

  const renderUploadModal = () => {
    switch (activeTab) {
      case 0:
        return (
          <UploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
          />
        );
      case 1:
        return (
          <BestSellerUploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
          />
        );
      case 2:
        return (
          <OnSaleUploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
          />
        );
      default:
        return null;
    }
  };

  const renderEditModal = () => {
    if (!selectedProductId) return null;
    
    switch (activeTab) {
      case 0:
        return (
          <EditModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            productId={selectedProductId}
          />
        );
      // Implement for other tabs when needed
      default:
        return null;
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 px-4">
        {displayProducts.map((product, idx) =>
          "isEmpty" in product ? (
            <EmptySlotCard
              key={`empty-${idx}`}
              onAdd={() => setIsUploadModalOpen(true)}
              tabName={tabName}
            />
          ) : (
            <ProductCard 
              key={`product-${idx}`} 
              {...product} 
              id={product.id} 
              onEdit={isEditor ? handleEditClick : undefined}
              onDelete={isEditor ? handleDeleteClick : undefined}
            />
          ),
        )}
      </div>

      {renderUploadModal()}
      {renderEditModal()}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};