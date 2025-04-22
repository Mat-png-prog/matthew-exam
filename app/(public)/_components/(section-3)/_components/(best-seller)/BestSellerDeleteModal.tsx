//app/(public)/_components/(section-3)/_components/(best-seller)/BestSellerDeleteModal.tsx

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import useBestSellerStore from "../../_store/(best-store)/best-seller-store";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  bestSellerId: string | null;
}

export const BestSellerDeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  bestSellerId,
}) => {
  const { deleteBestSeller, isLoading, clearError } = useBestSellerStore();

  const handleDelete = async () => {
    if (bestSellerId) {
      await deleteBestSeller(bestSellerId);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[390px]">
        <DialogHeader>
          <DialogTitle>Delete Slide</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-base">
            Are you sure you want to delete this slide? This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" disabled={isLoading} onClick={() => { clearError(); onClose(); }}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" disabled={isLoading} onClick={handleDelete}>
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};