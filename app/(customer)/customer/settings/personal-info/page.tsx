//app/(customer)/customer/settings/personal-info/page.tsx

import { Metadata } from "next";
import { UserSettingsForm } from "../_components/CustomerSettingsForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderSettingsForm } from "../_components/CheckoutSettingsForm";
import { redirect } from "next/navigation";
import { validateRequest } from "@/auth";
import { User, Order } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { cache } from "react";
import { OrderData } from "../types";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings and preferences.",
};

// Cache the user data fetch to prevent multiple database calls
const getUser = cache(async () => {
  const { user } = await validateRequest();
  if (!user) return null;
  return user as User;
});

// Cache the latest order fetch (can be empty if user never ordered)
const getLatestOrder = cache(async (userId: string) => {
  return await prisma.order.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  }) as Order | null;
});

export default async function SettingsPage() {
  try {
    const user = await getUser();

    if (!user) {
      return redirect("/login");
    }

    const latestOrderFromDB = await getLatestOrder(user.id);
    
    // Create an object conforming to OrderData type with all required fields
    // If there is no order, fill with user data or empty/defaults
    const latestOrder: OrderData = {
      id: latestOrderFromDB?.id ?? "",
      Branch: latestOrderFromDB?.Branch ?? "",
      methodOfCollection: latestOrderFromDB?.methodOfCollection ?? "",
      salesRep: latestOrderFromDB?.salesRep ?? "",
      referenceNumber: latestOrderFromDB?.referenceNumber ?? "",
      firstName: latestOrderFromDB?.firstName ?? user.firstName ?? "",
      lastName: latestOrderFromDB?.lastName ?? user.lastName ?? "",
      companyName: latestOrderFromDB?.companyName ?? "",
      countryRegion: latestOrderFromDB?.countryRegion ?? "",
      streetAddress: latestOrderFromDB?.streetAddress ?? user.streetAddress ?? "",
      apartmentSuite: latestOrderFromDB?.apartmentSuite ?? "",
      townCity: latestOrderFromDB?.townCity ?? user.townCity ?? "",
      province: latestOrderFromDB?.province ?? "",
      postcode: latestOrderFromDB?.postcode ?? user.postcode ?? "",
      phone: latestOrderFromDB?.phone ?? user.phoneNumber ?? "",
      email: latestOrderFromDB?.email ?? user.email ?? "",
      orderNotes: latestOrderFromDB?.orderNotes ?? "",
      agreeTerms: latestOrderFromDB?.agreeTerms ?? false,
      receiveEmailReviews: latestOrderFromDB?.receiveEmailReviews ?? false,
    };

    return (
      <div className="space-y-5">
        <div className="bg-muted/50 dark:bg-muted/20 p-5 rounded-lg mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences.
          </p>
        </div>

        <Tabs defaultValue="personal" className="space-y-4">
          <TabsList className="bg-card border border-border/40 p-1 w-full">
            <TabsTrigger 
              value="personal" 
              className="data-[state=active]:bg-background data-[state=active]:text-primary flex-1"
            >
              Personal Info
            </TabsTrigger>
            <TabsTrigger 
              value="checkout" 
              className="data-[state=active]:bg-background data-[state=active]:text-primary flex-1"
            >
              Checkout Details
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="data-[state=active]:bg-background data-[state=active]:text-primary flex-1"
            >
              Security
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent 
              value="personal" 
              className="space-y-3 pt-1"
            >
              <UserSettingsForm user={user} />
            </TabsContent>
            <TabsContent 
              value="checkout" 
              className="space-y-3 pt-1"
            >
              <OrderSettingsForm order={latestOrderFromDB ? latestOrder : undefined} userId={user.id} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    );
  } catch (error) {
    console.error("Settings page error:", error);
    return redirect("/login");
  }
}