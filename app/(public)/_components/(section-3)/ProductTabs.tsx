//app/(public)/_components/(section-3)/ProductTabs.tsx

"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductSlide } from "./_components/ProductSlide";
import { ProductCardProps } from "./types";
import useBestSellerStore from "./_store/(best-store)/best-seller-store";

// Define viewport types
type Viewport = "mobile" | "desktop";

const ProductTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState(1); // Start with Best Sellers (id: 1)
  const [activeSlide, setActiveSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [tabContent, setTabContent] = useState<{ [key: number]: ProductCardProps[][] }>({});

  // Get best sellers from store
  const { bestSellers, fetchBestSellers, isLoading, error } = useBestSellerStore();

  // Check for mobile viewport securely (no sensitive info logged)
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    console.log("[ProductTabs] Mounted: resize event listener set");
    return () => {
      window.removeEventListener("resize", checkMobile);
      console.log("[ProductTabs] Unmounted: resize event listener removed");
    };
  }, []);

  // Log isMobile value changes for debugging
  useEffect(() => {
    console.log(`[ProductTabs] isMobile state updated: ${isMobile}`);
  }, [isMobile]);

  // Fetch data on mount
  useEffect(() => {
    console.log("[ProductTabs] Fetching best sellers data");
    fetchBestSellers()
      .then(() => {
        console.log("[ProductTabs] Fetched best sellers data successfully");
      })
      .catch(err => {
        console.error("[ProductTabs] Error fetching best sellers:", err);
      });
  }, [fetchBestSellers]);

  // Process best sellers into the appropriate format when data or viewport changes
  useEffect(() => {
    if (bestSellers.length > 0) {
      console.log("[ProductTabs] Processing best sellers data:", bestSellers.length, "items");

      // Transform best sellers into ProductCardProps format
      const bestSellerCards: ProductCardProps[] = bestSellers.map(item => ({
        id: item.id, // Add ID for edit/delete functionality
        name: item.name,
        price: item.price.toFixed(2),
        rating: item.rating,
        image: item.imageUrl
      }));

      // Split into chunks for desktop and mobile
      const desktopChunks: ProductCardProps[][] = [];
      const mobileChunks: ProductCardProps[][] = [];

      // Desktop: 4 items per slide
      for (let i = 0; i < bestSellerCards.length; i += 4) {
        desktopChunks.push(bestSellerCards.slice(i, i + 4));
      }

      // Mobile: 2 items per slide
      for (let i = 0; i < bestSellerCards.length; i += 2) {
        mobileChunks.push(bestSellerCards.slice(i, i + 2));
      }

      // Set content for tab 1 (Best Sellers)
      setTabContent(prev => ({
        ...prev,
        1: isMobile ? mobileChunks : desktopChunks
      }));

      console.log(
        "[ProductTabs] Content prepared:",
        `Desktop: ${desktopChunks.length} slides, Mobile: ${mobileChunks.length} slides`
      );
    }
  }, [bestSellers, isMobile]);

  // Tabs definition
  const tabs = [
    { name: "New Arrivals", id: 0 },
    { name: "Best Sellers", id: 1 },
    { name: "On Sale", id: 2 },
  ];

  // Get content for the active tab
  const getContent = (tabId: number): ProductCardProps[][] => {
    console.log("[ProductTabs] Getting content for tab:", tabId);
    return tabContent[tabId] || [[]];
  };

  const currentContent = getContent(activeTab);
  const currentSlideContent = currentContent[activeSlide] || [];
  const maxSlides = currentContent.length;

  // Navigation handlers
  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % maxSlides);
    console.log(`[ProductTabs] Navigated to next slide: ${(activeSlide + 1) % maxSlides}`);
  };
  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + maxSlides) % maxSlides);
    console.log(`[ProductTabs] Navigated to previous slide: ${(activeSlide - 1 + maxSlides) % maxSlides}`);
  };

  // Reset slide when changing tabs
  useEffect(() => {
    setActiveSlide(0);
    console.log(`[ProductTabs] Tab changed to ${activeTab}, resetting to first slide`);
  }, [activeTab]);

  return (
    <div className="w-full py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        {/* Tabs */}
        <div className="flex justify-center mb-8 border-b border-border overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setActiveSlide(0);
                console.log(`[ProductTabs] Tab selected: ${tab.name} (id: ${tab.id})`);
              }}
              className={`px-4 md:px-8 py-4 font-medium text-base md:text-lg transition-colors relative whitespace-nowrap
                ${activeTab === tab.id
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-primary"
                }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-8">Loading products...</div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-8 text-destructive">
            Error loading products: {error}
          </div>
        )}

        {/* Products Container */}
        {!isLoading && !error && (
          <div className="relative">
            <div className="overflow-hidden">
              <div className="transition-transform duration-300 ease-in-out">
                <ProductSlide
                  products={currentSlideContent}
                  isMobile={isMobile}
                  activeTab={activeTab}
                  tabName={tabs.find(tab => tab.id === activeTab)?.name || ""}
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            {maxSlides > 1 && (
              <>
                <button
                  onClick={handlePrevSlide}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 bg-background border border-border rounded-full p-2 shadow-md hover:bg-secondary transition-colors"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </button>
                <button
                  onClick={handleNextSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 bg-background border border-border rounded-full p-2 shadow-md hover:bg-secondary transition-colors"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </button>
              </>
            )}

            {/* Slide Indicators */}
            {maxSlides > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {[...Array(maxSlides)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveSlide(idx);
                      console.log(`[ProductTabs] Slide indicator clicked: Slide ${idx + 1}`);
                    }}
                    className={`w-2 h-2 rounded-full transition-colors
                      ${activeSlide === idx ? "bg-primary" : "bg-secondary"}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;