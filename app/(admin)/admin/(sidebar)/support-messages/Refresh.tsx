// Create client-side refresh button component
'use client';

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

function RefreshButton() {
  return (
    <form action="/api/refresh-messages"> {/* Create this API route for handling refreshes */}
      <Button
        variant="outline"
        type="submit"
        className="flex items-center gap-2"
      >
        <RefreshCw size={16} />
        Refresh Data
      </Button>
    </form>
  );
}

export default  RefreshButton;