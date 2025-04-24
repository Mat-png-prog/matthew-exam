//AddSlideModal.tsx
"use client" // Marks this component as a Client Component in Next.js

import type React from "react"

// Import form handling utilities
import { useForm } from "react-hook-form" // Manages form state and validation
import { zodResolver } from "@hookform/resolvers/zod" // Connects zod schemas to react-hook-form

// Import UI components from shadcn/ui library
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog" // Modal dialog components

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form" // Form components with built-in validation display

import { Input } from "@/components/ui/input" // Input field component
import { Button } from "@/components/ui/button" // Button component
import { Textarea } from "@/components/ui/textarea" // Multiline text input component

// Dropdown selection components
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// React hooks for state management and side effects
import { useState, useEffect, useCallback } from "react" // Added useCallback for memoization
import { toast } from "sonner" // Toast notification library

// Import validation schema and type definitions
import { createSlideSchema, type CreateSlideInput } from "./validations"
import Image from "next/image" // Next.js optimized image component
import useSlideStore from "./_crud-actions/_store/use-slide-store"


// Props interface for the AddSlideModal component
interface AddSlideModalProps {
  isOpen: boolean // Controls whether the modal is visible
  onClose: () => void // Function to call when the modal is closed
  onSuccess: () => void // Function to call when a slide is successfully created
  targetIndex: number // The index where the new slide will be inserted
}

// Background color options for the slides with both value (CSS class) and human-readable label
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
]

// Main component definition
const AddSlideModal: React.FC<AddSlideModalProps> = ({ isOpen, onClose, onSuccess, targetIndex }) => {
  // State for tracking form submission and preview states
  const [loading, setLoading] = useState(false)

  // State for previewing the selected background color
  const [previewBgColor, setPreviewBgColor] = useState<string>("")

  // State for previewing the slide image
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Get the slide store functions for creating and updating slides
  const { createSlide, slides, updateSlide } = useSlideStore()

  // Initialize the form with react-hook-form and zod validation
  const form = useForm<CreateSlideInput>({
    resolver: zodResolver(createSlideSchema), // Use zod schema for validation
    defaultValues: {
      title: "",
      description: "",
      bgColor: "",
      order: targetIndex + 1, // Convert from zero-based index to one-based order
      sliderImage: undefined, // Initialize as undefined since no image is selected yet
    },
  })

  // Memoize the handleOrderPreview function using useCallback to prevent unnecessary recreations
  // This function provides immediate visual feedback when changing slide order
  const handleOrderPreview = useCallback(
    (newOrder: number) => {
      // Skip if order is invalid
      if (!newOrder || newOrder < 1 || newOrder > slides.length + 1) {
        return
      }

      // Form value is already set, no need for additional preview logic for new slides
      // This is different from EditSlideModal where we need to preview reordering
    },
    [slides.length],
  )

  // Watch for changes to form fields and update previews
  useEffect(() => {
    // Subscribe to form value changes
    const subscription = form.watch((value, { name }) => {
      // Update the background color preview when the bgColor field changes
      if (name === "bgColor" && value.bgColor) {
        setPreviewBgColor(value.bgColor as string)
      }

      // Handle immediate order updates for better UX
      if (name === "order" && value.order) {
        handleOrderPreview(value.order)
      }
    })

    // Clean up the subscription when the component unmounts
    return () => subscription.unsubscribe()
  }, [form, handleOrderPreview]) // Added handleOrderPreview to dependencies

  // Handle file selection for slide image
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Update the form with the selected file
      form.setValue("sliderImage", file, { shouldValidate: true })

      // Create a preview of the selected image
      const fileReader = new FileReader()
      fileReader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      fileReader.readAsDataURL(file)
    }
  }

  // Form submission handler
  async function onSubmit(data: CreateSlideInput) {
    try {
      setLoading(true)

      // Reorder existing slides if adding a slide in the middle of the sequence
      const existingSlides = slides.filter(
        (slide) => slide.order >= data.order, // Use data.order instead of targetIndex+1 to respect manual order changes
      )

      if (existingSlides.length > 0) {
        // Update the order of all existing slides that come after our insertion point
        for (const slide of existingSlides) {
          const updateFormData = new FormData()
          updateFormData.append("id", slide.id)
          updateFormData.append("order", String(slide.order + 1))
          await updateSlide(updateFormData)
        }
      }

      // Create FormData object to send to the server (supports file uploads)
      const formData = new FormData()
      formData.append("sliderImage", data.sliderImage)
      formData.append("title", data.title)
      formData.append("description", data.description)
      formData.append("bgColor", data.bgColor)
      formData.append("order", String(data.order)) // Use the order from the form data

      // Submit the form data to create the new slide
      const result = await createSlide(formData)

      // Handle API errors
      if (!result.success) {
        throw new Error(result.error)
      }

      // Show success message and close modal
      toast.success("Slide created successfully!")
      form.reset()
      setImagePreview(null)
      setPreviewBgColor("")
      onSuccess()
      onClose()
    } catch (error) {
      // Display error message if creation fails
      toast.error(error instanceof Error ? error.message : "Failed to create slide")
    } finally {
      // Reset loading state regardless of outcome
      setLoading(false)
    }
  }

  // Component render
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Slide (Position {form.watch("order")})</DialogTitle>
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
                      previewBgColor || "bg-transparent"
                    }`}
                  >
                    {imagePreview ? (
                      <div className="relative w-full h-full">
                        {/* Display image preview with reduced opacity to show background color */}
                        <Image
                          height={1}
                          width={1}
                          src={imagePreview || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-md opacity-80"
                        />
                        {/* Overlay to emphasize background color */}
                        <div className="absolute inset-0 bg-black/30 rounded-md"></div>
                      </div>
                    ) : (
                      <div className="text-center p-6">
                        <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 6MB</p>
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
                    <Textarea placeholder="Enter slide description" className="resize-none" rows={3} {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a background color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bgColorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="flex items-center gap-2">
                          {/* Color preview swatch */}
                          <span className={`inline-block w-6 h-6 rounded-full ${option.value}`}></span>
                          <span>{option.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    This color will show through the slide image with a subtle opacity effect
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Position Field - Allow manual override of the slide position */}
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
                      max={slides.length + 1}
                      {...field}
                      onChange={(e) => {
                        // Parse the input value or fallback to default
                        const newValue = Number.parseInt(e.target.value) || targetIndex + 1
                        field.onChange(newValue)
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Position where this slide will appear (1 is first, {slides.length + 1} is last)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Submission Buttons */}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Slide"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddSlideModal
