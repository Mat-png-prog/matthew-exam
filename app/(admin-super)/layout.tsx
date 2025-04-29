//app/(admin-super)/layout.tsx

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { UserRole } from "@prisma/client";
import SessionProvider from "./SessionProvider";
import Navbar from "@/components/Navbar";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, session } = await validateRequest();

  // Check if user exists and has SUPERADMIN role
  if (!user || user.role !== UserRole.SUPERADMIN) {
    redirect("/");
  }

  // If we're not already on the routing hub, redirect there
  if (user && user.role === UserRole.SUPERADMIN) {
    // Only redirect if we're not already on the routing-hub page
    // This check prevents an infinite redirect loop
    const url = new URL(headers().get("x-url") || "/");
    if (!url.pathname.includes("/super-admin/routing-hub")) {
      redirect("/super-admin/routing-hub");
    }
  }

  return (
    <SessionProvider value={{ user, session }}>
      <Navbar />
      <main>
        {children}
      </main>
      <Toaster position="top-center" />
    </SessionProvider>
  );
}
