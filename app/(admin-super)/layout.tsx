//app/(admin-super)/layout.tsx

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { UserRole } from "@prisma/client";
import SessionProvider from "./SessionProvider";
import Navbar from "@/components/Navbar";

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
