//app/(admin)/admin/(sidebar)/support-messages/page.tsx

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { DataTable } from "./DataTable";
import { columns } from "./Column";
import { Toaster } from "sonner";
import { getSupportMessages } from "@/app/_actions/support"; // Server action
import { Suspense } from 'react';
import RefreshButton from './Refresh';
import { SupportMessage, SupportMessagePriority, SupportMessageStatus } from "@/types/support";

// Loading spinner component
function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
    </div>
  );
}

function convertPriority(priority: string): SupportMessagePriority {
  switch (priority) {
    case "LOW": return SupportMessagePriority.LOW;
    case "MEDIUM": return SupportMessagePriority.MEDIUM;
    case "HIGH": return SupportMessagePriority.HIGH;
    case "URGENT": return SupportMessagePriority.URGENT;
    default: return SupportMessagePriority.LOW;
  }
}
function convertStatus(status: string): SupportMessageStatus {
  switch (status) {
    case "NEW": return SupportMessageStatus.NEW;
    case "PENDING": return SupportMessageStatus.PENDING;
    case "RESOLVED": return SupportMessageStatus.RESOLVED;
    case "CLOSED": return SupportMessageStatus.CLOSED;
    default: return SupportMessageStatus.NEW;
  }
}

export default async function SupportMessagesPage() {
  // Server-side auth check
  const { user } = await validateRequest();
  if (!user || user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
    console.warn(`[ADMIN PAGE] Unauthorized admin page access at ${new Date().toISOString()}`);
    redirect('/login');
  }

  // Fetch messages server-side (decrypted)
  const rawMessages = await getSupportMessages();

  // Map missing fields to null or appropriate fallback values to match SupportMessage type
  const messages: SupportMessage[] = rawMessages.map(message => ({
    id: message.id,
    title: message.title,
    message: message.message, // This is now decrypted on the server
    priority: convertPriority(message.priority as string),
    status: convertStatus(message.status as string),
    createdAt: message.createdAt?.toISOString?.() ?? String(message.createdAt ?? ""),
    firstResponseAt: message.firstResponseAt ? message.firstResponseAt.toISOString() : null,
    updatedAt: message.updatedAt?.toISOString?.() ?? null,
    resolvedAt: message.resolvedAt ? message.resolvedAt.toISOString() : null,
    closedAt: message.closedAt ? message.closedAt.toISOString() : null,
    user: {
      firstName: message.user.firstName,
      lastName: message.user.lastName,
      email: message.user.email
    }
  }));

  console.log(`[ADMIN PAGE] Rendered with ${messages.length} decrypted messages at ${new Date().toISOString()}`);

  return (
    <>
      <Toaster
        richColors
        closeButton
        position="top-center"
        expand={true}
        visibleToasts={10}
        duration={Infinity}
        gap={10}
        offset={{ top: 20, right: 20 }}
        mobileOffset={{ bottom: 10 }}
        containerAriaLabel="Toast notifications"
        swipeDirections={['left', 'right']}
        pauseWhenPageIsHidden={true}
      />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Support Messages
            </h1>
            <p className="text-muted-foreground">
              View and manage customer support inquiries
            </p>
          </div>
          <Suspense>
            <RefreshButton />
          </Suspense>
        </div>
        <Suspense fallback={<LoadingState />}>
          <DataTable columns={columns} data={messages} />
        </Suspense>
      </div>
    </>
  );
}