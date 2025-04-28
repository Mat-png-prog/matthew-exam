//app/(public)/(group-products)/apparel/AddApparelSlideModal.tsx

"use client";

// Import all dependencies, hooks, and UI components
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { createSlideSchema, type CreateSlideInput } from "../../_components/(section-1)/validations";
import useApparelSlideStore from "./_store/apparel-slide";
import Image from "next/image";

// Props for AddApparelSlideModal component
interface AddApparelSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  targetIndex: number;
}

// Options for background color selection
const bgColorOptions = [
  { value: "bg-transparent", label: "No Background Colour" },
  { value: "bg-blue-500", label: "Blue" },
  { value: "bg-purple-500", label: "Purple" },
  { value: "bg-green-500", label: "Green" },
  { value: "bg-red-500", label: "Red" },
  { value: "bg-yellow-500", label: "Yellow" },
  { value: "bg-indigo-500", label: "Indigo" },
  { value: "bg-pink-500", label: "Pink" },
  { value: "bg-gray-500", label: "Gray" },
];

// AddApparelSlideModal component for adding a new slide
const AddApparelSlideModal: React.FC<AddApparelSlideModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  targetIndex,
}) => {
  // Local state for loading, preview background color, and preview image
  const [loading, setLoading] = useState(false);
  const [previewBgColor, setPreviewBgColor] = useState<string>("bg-transparent");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { createSlide, slides } = useApparelSlideStore();

  // Form initialization using react-hook-form and zod for validation
  const form = useForm<CreateSlideInput>({
    resolver: zodResolver(createSlideSchema),
    defaultValues: {
      title: "",
      description: "",
      bgColor: "bg-transparent",
      order: targetIndex + 1,
      sliderImage: undefined,
    },
  });

  // Watch for background color field change to update preview color
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "bgColor" && value.bgColor) {
        setPreviewBgColor(value.bgColor as string);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // File change handler for image preview and form value
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("sliderImage", file, { shouldValidate: true });
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      fileReader.readAsDataURL(file);
    }
  };

  // Form submit handler to add slide
  async function onSubmit(data: CreateSlideInput) {
    try {
      setLoading(true);
      // Secure and detailed console log
      console.log("[AddApparelSlideModal] Submitting new slide data (not exposing sensitive info)", { title: data.title, order: data.order });
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("bgColor", data.bgColor);
      formData.append("order", String(data.order));
      if (data.sliderImage) {
        formData.append("sliderImage", data.sliderImage);
      }
      const result = await createSlide(formData);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Slide added successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      if (typeof window === "undefined") {
        // Only log on server for security
        console.error("[AddApparelSlideModal] Add error:", error);
      }
      toast.error(
        error instanceof Error ? error.message : "Failed to add slide"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* DialogContent now has max height and scrolling as in EditSlideModal */}
      <DialogContent className="sm:max-w-[525px] max-h-[calc(100vh-4rem)] overflow-y-auto focus-visible:outline-none scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-neutral-400 dark:scrollbar-thumb-neutral-600">
        <DialogHeader>
          <DialogTitle>
            Add Slide (Position Last)
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Image Upload Field with Preview Area and Faint Background Color Preview */}
            <FormField
              control={form.control}
              name="sliderImage"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Slide Image</FormLabel>
                  <div
                    // The background color is shown underneath the image preview but with low opacity
                    className={`relative w-full h-40 border-2 border-dashed rounded-md flex items-center justify-center ${previewBgColor}`}
                  >
                    {imagePreview ? (
                      <div className="relative w-full h-full">
                        <Image
                          width={1}
                          height={1}
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-md opacity-100"
                        />
                        <span className="absolute left-2 top-2 bg-black/60 text-xs px-2 py-0.5 rounded text-white z-10">
                          Preview
                        </span>
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
                    <Input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.bmp,.tiff"
                      onChange={handleFileChange}
                      {...field}
                    />
                  </div>
                  <FormDescription>
                    {imagePreview
                      ? "New image selected. Submit to add the slide."
                      : "Upload an image for this slide (optional)."}
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
                          <span
                            className={`inline-block w-6 h-6 rounded-full ${option.value}`}
                          ></span>
                          <span>{option.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    This color will be used as the slide background.
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
                {loading ? "Adding..." : "Add Slide"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddApparelSlideModal;