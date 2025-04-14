//EditSlideModal.tsx
"use client"; // Marks this component as a Client Component in Next.js

// Import form handling utilities
import { useForm } from "react-hook-form"; // Manages form state and validation
import { zodResolver } from "@hookform/resolvers/zod"; // Connects zod schemas to react-hook-form

// Import UI components from shadcn/ui library
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // Modal dialog components

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"; // Form components with built-in validation display

import { Input } from "@/components/ui/input"; // Input field component
import { Button } from "@/components/ui/button"; // Button component
import { Textarea } from "@/components/ui/textarea"; // Multiline text input component

// Dropdown selection components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// React hooks for state management and side effects
import { useState, useEffect, useCallback } from "react"; // Added useCallback for memoization
import { toast } from "sonner"; // Toast notification library

// Import validation schema and type definitions
import { editSlideSchema, type EditSlideFormValues } from "./validations";
import { useSlideStore } from "./_crud-actions/_store/use-slide-store"; // Custom store for slide state
import { Slide } from "./types"; // Type definition for Slide
import Image from "next/image"; // Next.js optimized image component

// Props interface for the EditSlideModal component
interface EditSlideModalProps {
  isOpen: boolean; // Controls modal visibility
  onClose: () => void; // Function to call when modal is closed
  onSuccess: () => void; // Function to call after successful update
  slide: Slide; // The slide data to edit
}

// Background color options for the slides
const bgColorOptions = [
  {value: "bg-tranparent", label:"No Background Colour"},
  { value: "bg-blue-500", label: "Blue" },
  { value: "bg-purple-500", label: "Purple" },
  { value: "bg-green-500", label: "Green" },
  { value: "bg-red-500", label: "Red" },
  { value: "bg-yellow-500", label: "Yellow" },
  { value: "bg-indigo-500", label: "Indigo" },
  { value: "bg-pink-500", label: "Pink" },
  { value: "bg-gray-500", label: "Gray" },
];

// Main component definition
const EditSlideModal: React.FC<EditSlideModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  slide,
}) => {
  // State for tracking form submission status
  const [loading, setLoading] = useState(false);
  
  // State for previewing the selected background color
  const [previewBgColor, setPreviewBgColor] = useState<string>(slide.bgColor);
  
  // State for previewing the slide image (either existing or newly selected)
  const [imagePreview, setImagePreview] = useState<string | null>(slide.sliderImageurl);
  
  // Get the slide store functions for managing slides
  const { updateSlide, slides, setSlides } = useSlideStore();

  // Initialize the form with react-hook-form and zod validation
  const form = useForm<EditSlideFormValues>({
    resolver: zodResolver(editSlideSchema), // Use zod schema for validation
    defaultValues: {
      // Pre-populate form with existing slide data
      title: slide.title,
      description: slide.description,
      bgColor: slide.bgColor,
      order: slide.order,
      currentImageUrl: slide.sliderImageurl,
      sliderImage: undefined, // Initialize as undefined since no new image is selected yet
    },
  });

  // Memoize the handleOrderPreview function using useCallback to prevent unnecessary recreations
  // This function provides immediate visual feedback when changing slide order
  const handleOrderPreview = useCallback((newOrder: number) => {
    // Skip if order is invalid or unchanged
    if (!newOrder || newOrder === slide.order || newOrder < 1 || newOrder > slides.length) {
      return;
    }
    
    // Create a deep copy of slides to avoid direct state mutation
    const updatedSlides = JSON.parse(JSON.stringify(slides));
    
    // Find the slide we're currently modifying
    const slideToMove = updatedSlides.find((s: Slide) => s.id === slide.id);
    if (!slideToMove) return;
    
    // Update all slides' orders based on the reordering logic
    updatedSlides.forEach((s: Slide) => {
      if (s.id === slide.id) {
        // Update the current slide's order for preview
        s.order = newOrder;
      } else if (
        // Moving down - shift slides in between up
        (newOrder > slideToMove.order && s.order > slideToMove.order && s.order <= newOrder) ||
        // Moving up - shift slides in between down
        (newOrder < slideToMove.order && s.order >= newOrder && s.order < slideToMove.order)
      ) {
        s.order = newOrder > slideToMove.order ? s.order - 1 : s.order + 1;
      }
    });
    
    // Sort slides by order for display
    updatedSlides.sort((a: Slide, b: Slide) => a.order - b.order);
    
    // Update the store with the optimistically updated slides
    setSlides(updatedSlides);
  }, [slide.id, slide.order, slides, setSlides]); // Include all dependencies

  // Watch for changes to form fields and update previews
  useEffect(() => {
    // Subscribe to form value changes
    const subscription = form.watch((value, { name }) => {
      // Update the background color preview when the bgColor field changes
      if (name === 'bgColor' && value.bgColor) {
        setPreviewBgColor(value.bgColor as string);
      }
      
      // Handle immediate order updates for better UX
      if (name === 'order' && value.order && value.order !== slide.order) {
        handleOrderPreview(value.order);
      }
    });
    
    // Clean up the subscription when the component unmounts
    return () => subscription.unsubscribe();
  }, [form, slide.order, handleOrderPreview]); // Added handleOrderPreview to dependencies

  // Handle file selection for slide image
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Update the form with the selected file
      form.setValue("sliderImage", file, { shouldValidate: true });
      
      // Create a preview of the selected image
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      fileReader.readAsDataURL(file);
    }
  };

  // Form submission handler
  async function onSubmit(data: EditSlideFormValues) {
    try {
      setLoading(true);
      const newOrder = data.order;
      const oldOrder = slide.order;

      // Create FormData object to send to the server (supports file uploads)
      const formData = new FormData();
      formData.append("id", slide.id);
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("bgColor", data.bgColor);
      formData.append("order", String(newOrder));
      
      // Only append the file if a new one was selected
      if (data.sliderImage) {
        formData.append("sliderImage", data.sliderImage);
      }

      // Handle order changes - update other slides affected by this reordering
      if (newOrder !== oldOrder) {
        // Find all slides that need their order adjusted
        const affectedSlides = slides.filter(s => {
          // For moving a slide to a later position (e.g., from 1 to 3)
          if (newOrder > oldOrder) {
            return s.order > oldOrder && s.order <= newOrder && s.id !== slide.id;
          }
          // For moving a slide to an earlier position (e.g., from 3 to 1)
          else {
            return s.order >= newOrder && s.order < oldOrder && s.id !== slide.id;
          }
        });

        // Update the order of affected slides in the backend
        for (const affectedSlide of affectedSlides) {
          const updateFormData = new FormData();
          updateFormData.append("id", affectedSlide.id);
          
          if (newOrder > oldOrder) {
            // If moving later, shift affected slides down
            updateFormData.append("order", String(affectedSlide.order - 1));
          } else {
            // If moving earlier, shift affected slides up
            updateFormData.append("order", String(affectedSlide.order + 1));
          }
          
          // Send update request for each affected slide
          await updateSlide(updateFormData);
        }
      }

      // Submit the form data to update the current slide
      const result = await updateSlide(formData);

      // Handle API errors
      if (!result.success) {
        throw new Error(result.error);
      }

      // Show success message and close modal
      toast.success("Slide updated successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      // Display error message if update fails
      toast.error(
        error instanceof Error ? error.message : "Failed to update slide",
      );
      // Note: We should ideally revert the optimistic updates here
    } finally {
      // Reset loading state regardless of outcome
      setLoading(false);
    }
  }

  // Component render
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Slide (Position {form.watch("order")})</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Image Upload Field with Preview Area */}
            <FormField
              control={form.control}
              name="sliderImage"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Slide Image</FormLabel>
                  <div 
                    className={`relative w-full h-40 border-2 border-dashed rounded-md flex items-center justify-center ${
                      previewBgColor
                    }`}
                  >
                    {imagePreview ? (
                      <div className="relative w-full h-full">
                        {/* Display image preview with reduced opacity to show background color */}
                        <Image
                          width={1}
                          height={1}
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-md opacity-50"
                        />
                      </div>
                    ) : (
                      <div className="text-center p-6">
                        <p className="text-sm text-white">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-white/80 mt-1">
                          PNG, JPG, GIF up to 6MB
                        </p>
                      </div>
                    )}
                    {/* Hidden file input for image selection */}
                    <Input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.bmp,.tiff"
                      onChange={handleFileChange}
                      {...field}
                    />
                  </div>
                  <FormDescription>
                    {imagePreview === slide.sliderImageurl
                      ? "Current image shown. Upload a new one to replace it."
                      : "New image selected. Submit to save changes."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter slide title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter slide description"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Background Color Field */}
            <FormField
              control={form.control}
              name="bgColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Background Color</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a background color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bgColorOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="flex items-center gap-2"
                        >
                          {/* Color preview swatch */}
                          <span
                            className={`inline-block w-6 h-6 rounded-full ${option.value}`}
                          ></span>
                          <span>{option.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    This color will show through the slide image for better visibility
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Position Field - Allow manual override with immediate visual feedback */}
            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      max={slides.length} 
                      {...field}
                      onChange={(e) => {
                        // Parse the input value or fallback to current order
                        const newValue = parseInt(e.target.value) || slide.order;
                        field.onChange(newValue);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Position where this slide will appear (1 is first, {slides.length} is last)
                    <br />
                    <span className="text-blue-500 text-xs">Changes are previewed immediately!</span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Submission Buttons */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Slide"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSlideModal;