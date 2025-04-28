//app/(public)/(group-products)/apparel/page.tsx

import { validateRequest } from "@/auth";
import { getApparelSlides } from "./_actions/create-read";
import HeroSliderApparel from "./HeroSliderApparel";
import ApparelProducts from "./ApparelProducts";

export default async function ApparelPage() {
  const [slidesResponse, { user }] = await Promise.all([
    getApparelSlides(),
    validateRequest(),
  ]);
  const userRole = user?.role ?? "USER";
  const slides = slidesResponse.success ? slidesResponse.data || [] : [];

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Apparel Collection</h1>
      {/* Hero Section - Positioned absolutely to span full width */}
      <div className="absolute -left-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <HeroSliderApparel
          userRole={userRole}
          initialSlides={slides}
          autoPlay={true}
        />
        {!slidesResponse.success && (
          <div className="text-center py-4 text-red-500">
            Error loading banner: {slidesResponse.error}
          </div>
        )}
      </div>

      {/* Spacer to push content below hero slider */}
      <div className="w-full" style={{ height: "calc(300px + 2rem)" }}></div>

      {/* Main Content */}
      <div>
        <ApparelProducts />
      </div>
    </>
  );
}