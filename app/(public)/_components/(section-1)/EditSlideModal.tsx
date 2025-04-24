//app/(public)/_components/(section-1)/EditSlideModal.tsx

"use client";

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
import { editSlideSchema, type EditSlideFormValues } from "./validations";
import useSlideStore from "./_crud-actions/_store/use-slide-store";
import { Slide } from "./types";
import Image from "next/image";

interface EditSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  slide: Slide;
}

const bgColorOptions = [
  { value: "bg-tranparent", label: "No Background Colour" },
  { value: "bg-blue-500", label: "Blue" },
  { value: "bg-purple-500", label: "Purple" },
  { value: "bg-green-500", label: "Green" },
  { value: "bg-red-500", label: "Red" },
  { value: "bg-yellow-500", label: "Yellow" },
  { value: "bg-indigo-500", label: "Indigo" },
  { value: "bg-pink-500", label: "Pink" },
  { value: "bg-gray-500", label: "Gray" },
];

const EditSlideModal: React.FC<EditSlideModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  slide,
}) => {
  const [loading, setLoading] = useState(false);
  const [previewBgColor, setPreviewBgColor] = useState<string>(slide.bgColor);
  const [imagePreview, setImagePreview] = useState<string | null>(slide.sliderImageurl);

  const { updateSlide, slides } = useSlideStore();

  // Only allow positions 1 ... slides.length (no "empty slot" at slides.length+1)
  const maxOrder = slides.length;

  const form = useForm<EditSlideFormValues>({
    resolver: zodResolver(editSlideSchema),
    defaultValues: {
      title: slide.title,
      description: slide.description,
      bgColor: slide.bgColor,
      order: slide.order,
      currentImageUrl: slide.sliderImageurl,
      sliderImage: undefined,
    },
  });

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "bgColor" && value.bgColor) {
        setPreviewBgColor(value.bgColor as string);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

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

  async function onSubmit(data: EditSlideFormValues) {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("id", slide.id);
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("bgColor", data.bgColor);
      formData.append("order", String(data.order));
      if (data.sliderImage) {
        formData.append("sliderImage", data.sliderImage);
      }
      const result = await updateSlide(formData);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Slide updated successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      if (typeof window === "undefined") {
        console.error("[EditSlideModal] Update error:", error);
      }
      toast.error(
        error instanceof Error ? error.message : "Failed to update slide"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[525px] max-h-[calc(100vh-4rem)] overflow-y-auto focus-visible:outline-none scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-neutral-400 dark:scrollbar-thumb-neutral-600"
      >
        <DialogHeader>
          <DialogTitle>
            Edit Slide (Position {form.watch("order")})
          </DialogTitle>
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
                    className={`relative w-full h-40 border-2 border-dashed rounded-md flex items-center justify-center ${previewBgColor}`}
                  >
                    {imagePreview ? (
                      <div className="relative w-full h-full">
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

            {/* Position Field - Only allow valid existing positions */}
            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-background text-foreground"
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    >
                      {Array.from({ length: maxOrder }, (_, idx) => idx + 1).map((val) => (
                        <option key={val} value={val}>
                          {val}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormDescription>
                    Select a valid position between 1 and {maxOrder}. You cannot move to a vacant slot.
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