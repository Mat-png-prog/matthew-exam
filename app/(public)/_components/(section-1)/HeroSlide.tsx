//HeroSlide.tsx
"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash } from "lucide-react"
import { toast } from "sonner"
import type { Slide } from "./types"
import AddSlideModal from "./AddSlideModal"
import EditSlideModal from "./EditSlideModal"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { SLIDE_INTERVAL } from "./utils"
import type { UserRole } from "@prisma/client"
import { useSlideStore } from "./_crud-actions/_store/use-slide-store"
import { cn } from "@/lib/utils"

/**
 * HeroSlider Component Props
 * @interface HeroSliderProps
 * @property {boolean} [autoPlay=true] - Whether the slider should automatically cycle through slides
 * @property {number} [interval=SLIDE_INTERVAL] - Time in milliseconds between slide transitions
 * @property {Function} [onSlidesChange] - Callback function when slides change
 * @property {UserRole} [userRole] - Current user's role to determine edit permissions
 * @property {Slide[]} initialSlides - Initial slides data to display
 */
interface HeroSliderProps {
  autoPlay?: boolean
  interval?: number
  onSlidesChange?: () => void
  userRole?: UserRole
  initialSlides: Slide[]
}

/**
 * HeroSlider Component
 *
 * A responsive hero section slider/carousel that supports:
 * - Auto-playing slides with configurable interval
 * - Editor controls for adding, editing, and deleting slides
 * - Responsive design for various screen sizes
 * - Loading and empty states
 */
const HeroSlider: React.FC<HeroSliderProps> = ({
  autoPlay = true,
  interval = SLIDE_INTERVAL,
  userRole,
  initialSlides,
}) => {
  // Maximum number of slides allowed
  const MAX_SLIDES = 4

  // Get slides and related functions from the slide store
  const { slides, isLoading, deleteSlide, setSlides } = useSlideStore()

  // State for tracking the current slide index
  const [currentSlide, setCurrentSlide] = useState(0)

  // Modal visibility states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Track if the component has been initialized with data
  const [isInitialized, setIsInitialized] = useState(false)

  // Index of the slide being targeted for an action
  const [targetIndex, setTargetIndex] = useState<number | null>(null)

  // Check if the current user has editor privileges
  const isEditor = userRole === "EDITOR"

  // Helper to check if any modal is currently open
  const isModalOpen = isAddModalOpen || isEditModalOpen || isDeleteModalOpen || isDeleting

  // Initialize slides from props when component mounts
  useEffect(() => {
    if (!isInitialized && initialSlides?.length > 0) {
      setSlides(initialSlides)
      setIsInitialized(true)
    }
  }, [initialSlides, setSlides, isInitialized])

  // Calculate how many slide slots to display (including the "add new" slot for editors)
  const totalSlotsToShow = isEditor
    ? Math.min(Math.max(1, slides.length + (slides.length < MAX_SLIDES ? 1 : 0)), MAX_SLIDES)
    : Math.max(1, slides.length)

  /**
   * Move to the next slide in the carousel
   */
  const nextSlide = useCallback(() => {
    if (slides.length === 0) return // Don't cycle if there are no slides
    setCurrentSlide((current) => (current + 1) % totalSlotsToShow)
  }, [slides.length, totalSlotsToShow])

  /**
   * Move to the previous slide in the carousel
   */
  const prevSlide = useCallback(() => {
    if (slides.length === 0) return // Don't cycle if there are no slides
    setCurrentSlide((current) => (current === 0 ? totalSlotsToShow - 1 : current - 1))
  }, [slides.length, totalSlotsToShow])

  // Set up auto-play timer
  useEffect(() => {
    // Don't auto-play if disabled, loading, modal is open, or no slides
    if (!autoPlay || isLoading || isModalOpen || slides.length === 0) return

    // Create interval timer for auto-play
    const timer = setInterval(nextSlide, interval)

    // Clean up timer on component unmount or dependencies change
    return () => clearInterval(timer)
  }, [autoPlay, interval, nextSlide, isLoading, isModalOpen, slides.length])

  /**
   * Handle successful completion of add/edit/delete operations
   */
  const handleSuccess = useCallback(() => {
    setIsAddModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteModalOpen(false)
    setTargetIndex(null)
  }, [])

  /**
   * Handle click on the "Add Slide" button or empty slot
   * @param {number} index - The index where the new slide should be added
   */
  const handleAddClick = useCallback((index: number) => {
    setCurrentSlide(index)
    setTargetIndex(index)
    // Delay opening the modal to allow slide transition to complete
    setTimeout(() => {
      setIsAddModalOpen(true)
    }, 500)
  }, [])

  // Show loading state when slides are being fetched (except for editors)
  if (isLoading && !isEditor) {
    return (
      <div className="relative w-screen h-[300px] bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  // Don't render anything if there are no slides and user is not an editor
  if (!isEditor && slides.length === 0) {
    return null
  }

  return (
    <div className="relative w-screen h-[300px] overflow-hidden bg-transparent">
      {/* Editor controls - only visible to users with editor role */}
      {isEditor && (
        <div className="absolute top-4 right-4 z-20 bg-black/50 rounded-lg p-2">
          <div className="flex items-center gap-4">
            {/* Add slide button - only shown if under the maximum limit */}
            {slides.length < MAX_SLIDES && (
              <button
                onClick={() => handleAddClick(slides.length)}
                className="hover:text-blue-400 transition-colors"
                aria-label="Add new slide"
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
            )}
            {/* Edit and delete buttons - only shown when a slide exists at current position */}
            {slides[currentSlide] && (
              <>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="hover:text-blue-400 transition-colors"
                  aria-label="Edit current slide"
                >
                  <Pencil className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="hover:text-blue-400 transition-colors"
                  aria-label="Delete current slide"
                  disabled={isDeleting}
                >
                  <Trash className="w-5 h-5 text-white" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main slider container */}
      <div className="w-[400%] h-full flex">
        {/* Slider track - transforms horizontally based on current slide */}
        <div
          className={cn(
            "w-full h-full flex transform transition-transform duration-500 ease-in-out",
            currentSlide === 0 ? "-translate-x-0" : "",
            currentSlide === 1 ? "-translate-x-1/4" : "",
            currentSlide === 2 ? "-translate-x-2/4" : "",
            currentSlide === 3 ? "-translate-x-3/4" : "",
          )}
        >
          {/* Generate slides based on calculated total slots */}
          {[...Array(totalSlotsToShow)].map((_, index) => {
            const slide = slides[index]
            const isEmptySlot = !slide && isEditor

            // Only render if it's a real slide or an empty slot in editor mode
            return (
              <div key={slide ? slide.id : `empty-${index}`} className="w-1/4 flex-shrink-0 h-full">
                {slide ? (
                  // Render actual slide content
                  <div
                    className={`relative w-full h-full flex flex-col items-center justify-center text-white ${slide.bgColor}`}
                  >
                    {/* Background image with reduced opacity to let background color show through */}
                    {slide.sliderImageurl && (
                      <Image
                        src={slide.sliderImageurl || "/placeholder.svg"}
                        alt={slide.title}
                        fill
                        priority
                        className="object-cover opacity-80" // Increased opacity from 50% to 70% for better visibility
                        sizes="100vw"
                      />
                    )}
                    {/* Slide content - positioned above the background image */}
                    <div className="relative z-10 text-center px-6 max-w-2xl">
                      <h2 className="text-4xl font-bold mb-4 text-shadow">{slide.title}</h2>
                      <p className="text-xl text-shadow">{slide.description}</p>
                    </div>
                  </div>
                ) : isEmptySlot && index === slides.length ? (
                  // Render "Add Slide" placeholder for editors
                  <div
                    className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => handleAddClick(index)}
                  >
                    <Plus className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-xl text-gray-500">Add Slide {index + 1}</p>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>

      {/* Navigation arrows - only shown when slides exist and no modal is open */}
      {slides.length > 0 && !isModalOpen && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 transition-colors p-2 rounded-full text-white"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 transition-colors p-2 rounded-full text-white"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Slide indicators/dots - only shown when slides exist */}
      {slides.length > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {[...Array(totalSlotsToShow)].map((_, index) => {
            // Only render indicators for real slides or the "add new" slot
            const isValidSlot = index < slides.length || (isEditor && index === slides.length)
            if (!isValidSlot) return null

            return (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  currentSlide === index
                    ? slides[index]
                      ? "bg-transparent" // Active real slide
                      : "bg-gray-600" // Active empty slot
                    : slides[index]
                      ? "bg-white/50" // Inactive real slide
                      : "bg-gray-300" // Inactive empty slot
                }`}
                aria-label={`Go to ${slides[index] ? "slide" : "empty slot"} ${index + 1}`}
              />
            )
          })}
        </div>
      )}

      <AddSlideModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleSuccess}
        targetIndex={targetIndex !== null ? targetIndex : 0}
      />

      {/* Edit modal - only rendered when a slide is selected for editing */}
      {isEditModalOpen && slides[currentSlide] && (
        <EditSlideModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleSuccess}
          slide={slides[currentSlide]}
        />
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this slide? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  setIsDeleting(true)
                  const slide = slides[currentSlide]
                  if (!slide) return

                  const result = await deleteSlide(slide.id)
                  if (result.success) {
                    toast.success("Slide deleted successfully")
                    // Adjust current slide index if necessary after deletion
                    if (currentSlide >= slides.length - 1) {
                      setCurrentSlide(Math.max(0, slides.length - 2))
                    }
                  } else {
                    throw new Error(result.error)
                  }
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Failed to delete slide")
                } finally {
                  setIsDeleting(false)
                  setIsDeleteModalOpen(false)
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSS for text shadow to improve readability against any background */}
      <style jsx global>{`
        .text-shadow {
          text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.75);
        }
      `}</style>
    </div>
  )
}

export default HeroSlider
