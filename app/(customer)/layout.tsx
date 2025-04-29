// app/(customer)/layout.tsx

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import SessionProvider from "./SessionProvider";
import { Toaster } from "sonner";
import { Tier, UserRole } from "@prisma/client";
import Navbar from "@/components/Navbar";
import CustomerSidebar from "./_components/CustomerSidebar";
import { getCustomerOrderCount } from "./_components/(sidebar)/_profile-actions/count-orders";
import { getCustomerWishlistCount } from "./_components/(sidebar)/_profile-actions/count-wishlist";
import { CustomerTier } from "./_components/(sidebar)/types";

export const dynamic = "force-dynamic";

// Function to map Tier (from database) to CustomerTier (frontend type)
const mapTierToCustomerTier = (tier: Tier | undefined): CustomerTier | undefined => {
  const tierMap: Record<Tier, CustomerTier> = {
    BRONZE: CustomerTier.BRONZE,
    SILVER: CustomerTier.SILVER,
    GOLD: CustomerTier.GOLD,
    PLATINUM: CustomerTier.PLATINUM,
  };
  return tier ? tierMap[tier] : undefined;
};

// Transform session.user to ensure compatibility with SessionUser type
const transformSessionUser = (sessionUser: any): any => ({
  ...sessionUser,
  tier: mapTierToCustomerTier(sessionUser.tier), // Map tier
  suburb: sessionUser.suburb ?? undefined,      // Convert null to undefined
  postcode: sessionUser.postcode ?? "",         // Ensure postcode is always a string
});

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();

  // Redirect to home page if the user is not a customer
  if (!session.user || session.user.role !== UserRole.CUSTOMER) {
    redirect("/");
  }

  // Fetch order count and wishlist count in parallel
  const [orderCountResponse, wishlistCountResponse] = await Promise.all([
    getCustomerOrderCount(),
    getCustomerWishlistCount(),
  ]);

  // Extract order count and wishlist count, with fallback to 0
  const orderCount = orderCountResponse.success
    ? orderCountResponse.totalOrders || 0
    : 0;

  const wishlistCount = wishlistCountResponse.success
    ? wishlistCountResponse.wishlistItemCount || 0
    : 0;

  // Safely transform session.user to match the expected type
  const customerUser = transformSessionUser(session.user);

  return (
    <SessionProvider value={session}>
      <Toaster />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex">
          <CustomerSidebar
            user={customerUser}
            orderCount={orderCount}
            wishlistCount={wishlistCount}
          />
          <main className="flex-grow p-6 ml-64 transition-all duration-300 bg-slate-100 min-h-screen">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}