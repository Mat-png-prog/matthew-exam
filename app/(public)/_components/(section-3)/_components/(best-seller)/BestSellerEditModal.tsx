//app/(public)/_components/(section-3)/_components/(best-seller)/BestSellerEditModal.tsx

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import useBestSellerStore from "../../_store/(best-store)/best-seller-store";
import Image from "next/image";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  bestSellerId: string | null;
}

export const BestSellerEditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  bestSellerId,
}) => {
  const {
    selectedBestSeller,
    fetchBestSellerById,
    updateBestSeller,
    isLoading,
    error,
    clearError,
  } = useBestSellerStore();
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (isOpen && bestSellerId) fetchBestSellerById(bestSellerId);
  }, [isOpen, bestSellerId, fetchBestSellerById]);

  useEffect(() => {
    if (selectedBestSeller) setRating(selectedBestSeller.rating);
  }, [selectedBestSeller]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();
    if (!selectedBestSeller) return;
    const formData = new FormData(e.currentTarget);
    formData.append("rating", rating.toString());
    await updateBestSeller(selectedBestSeller.id, formData);
    onClose();
  };

  if (!selectedBestSeller) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Best Seller</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={selectedBestSeller.name}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={selectedBestSeller.price}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Current Image</Label>
            <Image
              src={selectedBestSeller.imageUrl}
              alt="Current"
              className="w-32 h-20 object-contain border rounded-md"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">New Image (optional)</Label>
            <Input id="image" name="image" type="file" accept="image/*" />
          </div>
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <Star
                  key={value}
                  className={`w-6 h-6 cursor-pointer transition-colors ${
                    value <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300 hover:text-yellow-200"
                  }`}
                  onClick={() => setRating(value)}
                />
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => { clearError(); onClose(); }}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || rating === 0}>
              {isLoading ? "Saving..." : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};