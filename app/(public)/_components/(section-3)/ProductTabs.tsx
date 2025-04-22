"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductSlide } from "./_components/ProductSlide";
import { ProductCardProps } from "./types";
import useBestSellerStore from "./_store/(best-store)/best-seller-store";
import useNewArrivalsStore from "./_store/(new-store)/new-arrival-store";

// Define viewport types
type Viewport = "mobile" | "desktop";

const ProductTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState(1); // Start with Best Sellers (tab ID: 1)
  const [activeSlide, setActiveSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [tabContent, setTabContent] = useState<{ [key: number]: ProductCardProps[][] }>({});

  // Zustand stores
  const { bestSellers, fetchBestSellers, isLoading: bestSellersLoading, error: bestSellersError } =
    useBestSellerStore();
  const { newArrivals, fetchNewArrivals, isLoading: newArrivalsLoading, error: newArrivalsError } =
    useNewArrivalsStore();

  // Viewport detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    console.log("[ProductTabs] Mounted: Resize event listener set");

    return () => {
      window.removeEventListener("resize", checkMobile);
      console.log("[ProductTabs] Unmounted: Resize event listener removed");
    };
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchBestSellers().catch((err) =>
      console.error("[ProductTabs] Error fetching best sellers:", err)
    );
    fetchNewArrivals().catch((err) =>
      console.error("[ProductTabs] Error fetching new arrivals:", err)
    );
  }, [fetchBestSellers, fetchNewArrivals]);

  // Process and chunk data for tabs
  useEffect(() => {
    const processData = (data: any[], tabId: number, label: string) => {
      if (data.length === 0) return;

      console.log(`[ProductTabs] Processing ${label} data: ${data.length} items`);

      const cardProps: ProductCardProps[] = data.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price.toFixed(2),
        rating: item.rating,
        image: item.imageUrl,
      }));

      const chunkSize = isMobile ? 2 : 4;
      const chunks: ProductCardProps[][] = [];
      for (let i = 0; i < cardProps.length; i += chunkSize) {
        chunks.push(cardProps.slice(i, i + chunkSize));
      }

      setTabContent((prev) => ({
        ...prev,
        [tabId]: chunks,
      }));

      console.log(
        `[ProductTabs] ${label} content prepared for tab ${tabId}: ${chunks.length} slides`
      );
    };

    processData(bestSellers, 1, "Best Sellers");
    processData(newArrivals, 0, "New Arrivals");
  }, [bestSellers, newArrivals, isMobile]);

  // Tabs definition
  const tabs = [
    { name: "New Arrivals", id: 0 },
    { name: "Best Sellers", id: 1 },
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
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 md:px-8 py-4 font-medium text-base md:text-lg transition-colors relative whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Loading and Error States */}
        {(bestSellersLoading || newArrivalsLoading) && (
          <div className="text-center py-8">Loading products...</div>
        )}
        {(bestSellersError || newArrivalsError) && (
          <div className="text-center py-8 text-destructive">
            Error loading products.
          </div>
        )}

        {/* Products Container */}
        {!bestSellersLoading && !newArrivalsLoading && (
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
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 p-2 bg-background border border-border rounded-full shadow-md hover:bg-secondary transition-colors"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-5 h-5 text-primary" />
                </button>
                <button
                  onClick={handleNextSlide}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 bg-background border border-border rounded-full shadow-md hover:bg-secondary transition-colors"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-5 h-5 text-primary" />
                </button>
              </>
            )}

            {/* Slide Indicators */}
            {maxSlides > 1 && (
              <div className="flex justify-center mt-6 gap-2">
                {[...Array(maxSlides)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`w-2 h-2 rounded-full ${
                      activeSlide === idx ? "bg-primary" : "bg-secondary"
                    }`}
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