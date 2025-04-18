// app/(customer)/customer/settings/page.tsx

import { Metadata } from "next"; // Import for page metadata
import { UserSettingsForm } from "../_components/CustomerSettingsForm"; // Import user settings form component
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import tabs components
import { CheckoutSettingsForm } from "../_components/CheckoutSettingsForm"; // Import checkout form component
/* import { SecuritySettingsForm } from "./_components/SecuritySetingsForm"; */ // Security form import (commented out)
import { redirect } from "next/navigation"; // Import redirect function
import { validateRequest } from "@/auth"; // Import auth validation
import { User } from "@prisma/client"; // Import Prisma User type

// Define page metadata for SEO
export const metadata: Metadata = {
  title: "Settings", // Page title shown in browser tab
  description: "Manage your account settings and preferences.", // Page description for SEO
};

// Main settings page component - async to handle server-side data fetching
export default async function SettingsPage() {
  // Validate user authentication and get user data
  const { user } = await validateRequest();
  
  // If no user is found, redirect to login page
  if (!user) {
    // Log for debugging (server-side only, not exposed to browser)
    console.log("No authenticated user found, redirecting to login");
    redirect("/login");
  }

  // TypeScript casting - user is definitely not null at this point
  const typedUser = user as User;
  
  // Server-side console log (not exposed to browser)
  console.log(`Loading settings page for user: ${typedUser.id}`);

  return (
    <div className="space-y-5">
      {/* Page header with enhanced visibility */}
      <div className="bg-muted/50 dark:bg-muted/20 p-5 rounded-lg mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-primary">Settings</h1>
        <p className="text-foreground/80 mt-1">
          Manage your account settings and preferences.
        </p>
      </div>
      
      {/* Settings tabs with improved visual distinction */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="bg-card border border-border/40 p-1 w-full">
          <TabsTrigger value="personal" className="data-[state=active]:bg-background data-[state=active]:text-primary flex-1">
            Personal Info
          </TabsTrigger>
          <TabsTrigger value="checkout" className="data-[state=active]:bg-background data-[state=active]:text-primary flex-1">
            Checkout Details
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-background data-[state=active]:text-primary flex-1">
            Security
          </TabsTrigger>
        </TabsList>
        
        {/* Tab content sections */}
        <TabsContent value="personal" className="space-y-3 pt-1">
          <UserSettingsForm user={typedUser} />
        </TabsContent>
        <TabsContent value="checkout" className="space-y-3 pt-1">
          <CheckoutSettingsForm user={typedUser} />
        </TabsContent>
        {/* Security tab content (commented out) */}
        {/* <TabsContent value="security" className="space-y-6">
          <SecuritySettingsForm user={typedUser} />
        </TabsContent> */}
      </Tabs>
    </div>
  );
}