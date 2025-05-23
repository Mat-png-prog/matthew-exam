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

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
}

export const BestSellerEditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  productId,
}) => {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [isImageChanged, setIsImageChanged] = useState(false);

  const {
    updateBestSeller,
    isLoading,
    error,
    clearError,
    fetchBestSellerById,
    selectedBestSeller,
  } = useBestSellerStore();

  useEffect(() => {
    if (isOpen && productId) {
      fetchBestSellerById(productId);
    }
  }, [isOpen, productId, fetchBestSellerById]);

  useEffect(() => {
    if (selectedBestSeller) {
      setName(selectedBestSeller.name);
      setPrice(selectedBestSeller.price.toString());
      setRating(selectedBestSeller.rating);
    }
  }, [selectedBestSeller]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();

    if (rating === 0) {
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.append("rating", rating.toString());

    const imageFile = formData.get("image") as File;
    if (!imageFile || imageFile.size === 0) {
      formData.delete("image");
    }

    try {
      await updateBestSeller(productId, formData);
      onClose();
    } catch (error) {
      console.error("Error updating:", error);
    }
  };

  const handleFileChange = () => {
    setIsImageChanged(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Best Seller Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
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
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">
              {isImageChanged ? "New Product Image" : "Product Image (Optional)"}
            </Label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {!isImageChanged && selectedBestSeller?.imageUrl && (
              <p className="text-xs text-muted-foreground mt-1">
                Current image will be kept if no new image is selected
              </p>
            )}
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
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                clearError();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || rating === 0}>
              {isLoading ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};