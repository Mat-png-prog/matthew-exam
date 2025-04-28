//app/(public)/_components/(section-3)/_components/ProductSlide.tsx


import React, { useState } from "react";
import ProductCard from "./ProductCard";
import { UploadModal } from "./(new-arrivals)/UploadModal";
import { EditModal } from "./(new-arrivals)/EditModal";
import { BestSellerUploadModal } from "./(best-seller)/BestSellerUploadModal";
import { BestSellerEditModal } from "./(best-seller)/BestSellerEditModal";
import { EmptySlotCard } from "./EmptySlotCard";
import { ProductSlideProps } from "../types";
import { OnSaleEditModal } from "./(on-sale)/OnSaleEditModal";
import { OnSaleUploadModal } from "./(on-sale)/OnSaleModal";
import useNewArrivalsStore from "../_store/(new-in-store)/new-arrivals-store";
import useBestSellerStore from "../_store/(best-store)/best-seller-store";
import useOnSaleStore from "../_store/(on-sale)/onsale-store";
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

/**
 * ProductSlide component for displaying products in a grid layout with editing capabilities
 * @param products - Array of products to display
 * @param isMobile - Boolean flag indicating if the view is for mobile devices
 * @param activeTab - Current active tab index (0: New Arrivals, 1: Best Sellers, 2: On Sale)
 * @param tabName - Name of the current tab for display purposes
 */
export const ProductSlide: React.FC<ProductSlideProps> = ({
  products,
  isMobile,
  activeTab,
  tabName,
}) => {
  // State variables for new arrivals tab
  const [isNewArrivalsUploadModalOpen, setIsNewArrivalsUploadModalOpen] = useState(false);
  const [isNewArrivalsEditModalOpen, setIsNewArrivalsEditModalOpen] = useState(false);
  const [selectedNewArrivalId, setSelectedNewArrivalId] = useState<string | null>(null);
  
  // State variables for best sellers tab
  const [isBestSellersUploadModalOpen, setIsBestSellersUploadModalOpen] = useState(false);
  const [isBestSellersEditModalOpen, setIsBestSellersEditModalOpen] = useState(false);
  const [selectedBestSellerId, setSelectedBestSellerId] = useState<string | null>(null);
  
  // State variables for on sale tab
  const [isOnSaleUploadModalOpen, setIsOnSaleUploadModalOpen] = useState(false);
  const [isOnSaleEditModalOpen, setIsOnSaleEditModalOpen] = useState(false);
  const [selectedOnSaleId, setSelectedOnSaleId] = useState<string | null>(null);
  
  // Shared state for delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Get user session and check editor privileges
  const { user } = useSession();
  const isEditor = user?.role === "EDITOR" || user?.role === "SUPERADMIN";
  
  // Import store functions for each tab type
  const { deleteNewArrival } = useNewArrivalsStore();
  const { deleteBestSeller } = useBestSellerStore();
  const { deleteOnSaleItem } = useOnSaleStore();

  // Return null if no products are available
  if (!products || products.length === 0) {
    return null;
  }

  // Limit displayed products on mobile devices
  const displayProducts = isMobile ? products.slice(0, 2) : products;

  /**
   * Handlers for upload modal visibility based on tab
   */
  const handleOpenUploadModal = () => {
    // Open the appropriate upload modal based on active tab
    switch (activeTab) {
      case 0:
        setIsNewArrivalsUploadModalOpen(true);
        break;
      case 1:
        setIsBestSellersUploadModalOpen(true);
        break;
      case 2:
        setIsOnSaleUploadModalOpen(true);
        break;
      default:
        setIsNewArrivalsUploadModalOpen(true);
        break;
    }
  };

  /**
   * Handler for edit button click - sets product ID and opens appropriate modal
   * @param id - ID of the product to edit
   */
  const handleEditClick = (id: string) => {
    // Set product ID and open edit modal based on active tab
    switch (activeTab) {
      case 0: // New Arrivals
        setSelectedNewArrivalId(id);
        setIsNewArrivalsEditModalOpen(true);
        break;
      case 1: // Best Sellers
        setSelectedBestSellerId(id);
        setIsBestSellersEditModalOpen(true);
        break;
      case 2: // On Sale
        setSelectedOnSaleId(id);
        setIsOnSaleEditModalOpen(true);
        break;
      default:
        setSelectedNewArrivalId(id);
        setIsNewArrivalsEditModalOpen(true);
        break;
    }
  };

  /**
   * Handler for delete button click - sets product ID and opens confirmation dialog
   * @param id - ID of the product to delete
   */
  const handleDeleteClick = (id: string) => {
    // Set product ID based on active tab and open delete confirmation dialog
    switch (activeTab) {
      case 0: // New Arrivals
        setSelectedNewArrivalId(id);
        break;
      case 1: // Best Sellers
        setSelectedBestSellerId(id);
        break;
      case 2: // On Sale
        setSelectedOnSaleId(id);
        break;
      default:
        setSelectedNewArrivalId(id);
        break;
    }
    setIsDeleteDialogOpen(true); // Show delete confirmation dialog
  };

  /**
   * Handler for confirming product deletion
   * Calls appropriate delete function based on active tab
   */
  const handleConfirmDelete = async () => {
    // Delete product based on active tab and selected ID
    switch (activeTab) {
      case 0: // New Arrivals
        if (selectedNewArrivalId) {
          await deleteNewArrival(selectedNewArrivalId);
          setSelectedNewArrivalId(null);
        }
        break;
      case 1: // Best Sellers
        if (selectedBestSellerId) {
          await deleteBestSeller(selectedBestSellerId);
          setSelectedBestSellerId(null);
        }
        break;
      case 2: // On Sale
        if (selectedOnSaleId) {
          await deleteOnSaleItem(selectedOnSaleId);
          setSelectedOnSaleId(null);
        }
        break;
      default:
        if (selectedNewArrivalId) {
          await deleteNewArrival(selectedNewArrivalId);
          setSelectedNewArrivalId(null);
        }
        break;
    }
    
    // Reset delete dialog state
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      {/* Product grid layout - 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 px-4">
        {displayProducts.map((product, idx) =>
          "isEmpty" in product ? (
            // Render empty slot card with add button for editors
            <EmptySlotCard
              key={`empty-${idx}`}
              onAdd={handleOpenUploadModal}
              tabName={tabName}
            />
          ) : (
            // Render product card with edit/delete options for editors
            <ProductCard
              key={`product-${idx}`}
              {...product}
              onEdit={isEditor ? handleEditClick : undefined}
              onDelete={isEditor ? handleDeleteClick : undefined}
            />
          )
        )}
      </div>

      {/* New Arrivals Modals */}
      <UploadModal
        isOpen={isNewArrivalsUploadModalOpen}
        onClose={() => setIsNewArrivalsUploadModalOpen(false)}
      />
      {selectedNewArrivalId && (
        <EditModal
          isOpen={isNewArrivalsEditModalOpen}
          onClose={() => setIsNewArrivalsEditModalOpen(false)}
          productId={selectedNewArrivalId}
        />
      )}

      {/* Best Sellers Modals */}
      <BestSellerUploadModal
        isOpen={isBestSellersUploadModalOpen}
        onClose={() => setIsBestSellersUploadModalOpen(false)}
      />
      {selectedBestSellerId && (
        <BestSellerEditModal
          isOpen={isBestSellersEditModalOpen}
          onClose={() => setIsBestSellersEditModalOpen(false)}
          productId={selectedBestSellerId}
        />
      )}

      {/* On Sale Modals */}
      <OnSaleUploadModal
        isOpen={isOnSaleUploadModalOpen}
        onClose={() => setIsOnSaleUploadModalOpen(false)}
      />
      {selectedOnSaleId && (
        <OnSaleEditModal
          isOpen={isOnSaleEditModalOpen}
          onClose={() => setIsOnSaleEditModalOpen(false)}
          productId={selectedOnSaleId}
        />
      )}

      {/* Delete confirmation dialog - shared between all tabs */}
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
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
/* The issue is that the edit and delete buttons only show for the New Arrivals tab because of how the product data is being handled. I've made two key changes to fix this:

1. In the ProductCard component:
   - Added a `productId` variable that ensures we have a valid ID for all product types
   - Changed the condition to check for this productId instead of directly using props.id

2. In the ProductSlide component:
   - Removed the redundant `id={product.id}` in the ProductCard rendering, as the product object already contains the id property
   - Ensured that the product object is properly spread into the ProductCard component

The main issue was likely that the product objects for the Best Sellers and On Sale tabs might have a different structure or the id property wasn't being properly passed to the ProductCard component.

These changes should ensure that the edit and delete buttons appear for all tabs when an editor or superadmin is logged in, not just for the New Arrivals tab. */