// app/(admin)/admin/(sidebar)/support-messages/Refresh.tsx

"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { refreshAdminSupportMessages } from "@/app/_actions/support";

function RefreshButton() {
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(async () => {
      try {
        toast.loading("Refreshing messages...");
        await refreshAdminSupportMessages();
        toast.success("Messages refreshed!");
        console.log(`[REFRESH] Admin triggered support message refresh at ${new Date().toISOString()}`);
      } catch (error) {
        console.error("[REFRESH] Error refreshing messages:", error);
        toast.error("Error refreshing messages");
      }
    });
  };

  return (
    <Button
      variant="outline"
      type="button"
      className="flex items-center gap-2"
      onClick={handleRefresh}
      disabled={isPending}
      aria-label="Refresh support messages"
    >
      <RefreshCw size={16} className={isPending ? "animate-spin" : ""} />
      {isPending ? "Refreshing..." : "Refresh Data"}
    </Button>
  );
}

export default RefreshButton;