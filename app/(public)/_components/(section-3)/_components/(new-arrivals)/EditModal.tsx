//app/(public)/_components/(section-3)/_components/(new-arrivals)/EditModal.tsx

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
import useNewArrivalsStore from "../../_store/(new-in-store)/new-arrivals-store";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
}

export const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  productId,
}) => {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [isImageChanged, setIsImageChanged] = useState(false);
  
  const { 
    updateNewArrival, 
    isLoading, 
    error, 
    clearError, 
    fetchNewArrivalById,
    selectedNewArrival 
  } = useNewArrivalsStore();

  // Fetch product data when modal opens
  useEffect(() => {
    if (isOpen && productId) {
      fetchNewArrivalById(productId);
    }
  }, [isOpen, productId, fetchNewArrivalById]);

  // Populate form fields when product data is loaded
  useEffect(() => {
    if (selectedNewArrival) {
      setName(selectedNewArrival.name);
      setPrice(selectedNewArrival.price.toString());
      setRating(selectedNewArrival.rating);
    }
  }, [selectedNewArrival]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();

    if (rating === 0) {
      return; // Could add error handling for rating
    }

    const formData = new FormData(e.currentTarget);
    formData.append("rating", rating.toString());
    
    // If image field is empty and no new image is selected, don't include it in the form
    const imageFile = formData.get("image") as File;
    if (!imageFile || imageFile.size === 0) {
      formData.delete("image");
    }

    try {
      await updateNewArrival(productId, formData);
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
          <DialogTitle>Edit Product</DialogTitle>
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
            {!isImageChanged && selectedNewArrival?.imageUrl && (
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