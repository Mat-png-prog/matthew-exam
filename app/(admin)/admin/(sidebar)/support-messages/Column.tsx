"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { SupportMessage, SupportMessageStatus, SupportMessagePriority } from "@/types/support";
import { updateMessageStatus } from "@/app/_actions/support";
import { toast } from "sonner";
import { useSupportMessagesStore } from "@/app/_stores/supportMessagesStore";

const getPriorityColor = (priority: SupportMessagePriority): string => ({
  [SupportMessagePriority.URGENT]: "bg-red-500 text-white",
  [SupportMessagePriority.HIGH]: "bg-orange-500 text-white",
  [SupportMessagePriority.MEDIUM]: "bg-yellow-500",
  [SupportMessagePriority.LOW]: "bg-blue-500 text-white",
})[priority];

const getStatusColor = (status: SupportMessageStatus): string => ({
  [SupportMessageStatus.NEW]: "bg-blue-500 text-white",
  [SupportMessageStatus.PENDING]: "bg-yellow-500",
  [SupportMessageStatus.RESOLVED]: "bg-green-500 text-white",
  [SupportMessageStatus.CLOSED]: "bg-gray-500 text-white",
})[status];

// Create a separate React component for the actions cell
function MessageActions({ message }: { message: SupportMessage }) {
  const updateMessage = useSupportMessagesStore((state) => state.updateMessage);

  const handleStatusUpdate = async (status: SupportMessageStatus) => {
    const toastId = `toast-${message.id}`; // Generate a unique toast ID for the message

    try {
      // Show a loading toast while the update is in progress
      toast.loading("Updating status...", { id: toastId });

      const result = await updateMessageStatus(message.id, status);

      if (result.success) {
        // Update the message status locally
        updateMessage(message.id, { status });

        // Replace the loading toast with a success toast
        toast.success(`Status updated to ${status.toLowerCase()}`, {
          id: toastId, // Replace the existing toast
          duration: Infinity, // Display for 5 seconds
          icon: "✅", // Add a success icon
          dismissible: true,
        });
      } else {
        // If the operation failed, throw an error
        throw new Error(result.error || "Failed to update the status");
      }
    } catch (error) {
      console.error("Error updating status:", error);

      // Replace the loading toast with an error toast
      toast.error("Failed to update status", {
        id: toastId, // Replace the existing toast
        duration: Infinity, // Display for 7 seconds
        icon: "❌", // Add an error icon
        action: {
          label: "Retry", // Add a retry button
          onClick: () => handleStatusUpdate(status), // Retry logic
        },
      });

      // Revert the status locally to its previous value
      updateMessage(message.id, { status: message.status });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-8 w-8 p-0"
          aria-label="Open menu"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        {Object.values(SupportMessageStatus).map((status) => (
          <DropdownMenuItem
            key={status}
            onClick={() => handleStatusUpdate(status)}
          >
            Mark as {status.toLowerCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns = [
  {
    id: "priority",
    header: "Priority",
    cell: (message: SupportMessage) => (
      <Badge className={getPriorityColor(message.priority)}>
        {message.priority}
      </Badge>
    ),
  },
  {
    id: "title",
    header: "Title",
    cell: (message: SupportMessage) => (
      <div className="flex flex-col">
        <span className="font-medium line-clamp-1">{message.title}</span>
        <span className="text-sm text-muted-foreground line-clamp-2">
          {message.message}
        </span>
      </div>
    ),
  },
  {
    id: "user",
    header: "Customer",
    cell: (message: SupportMessage) => (
      <div className="flex flex-col">
        <span className="font-medium">
          {message.user.firstName} {message.user.lastName}
        </span>
        <span className="text-sm text-muted-foreground break-all">
          {message.user.email}
        </span>
      </div>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: (message: SupportMessage) => (
      <Badge className={getStatusColor(message.status)}>
        {message.status}
      </Badge>
    ),
  },
  {
    id: "responseTime",
    header: "Response Time",
    cell: (message: SupportMessage) => (
      message.firstResponseAt ? (
        <span title={new Date(message.firstResponseAt).toLocaleString()}>
          {formatDistanceToNow(new Date(message.firstResponseAt), {
            addSuffix: true,
          })}
        </span>
      ) : (
        <Badge variant="outline">No response yet</Badge>
      )
    ),
  },
  {
    id: "createdAt",
    header: "Created",
    cell: (message: SupportMessage) => (
      <span title={new Date(message.createdAt).toLocaleString()}>
        {formatDistanceToNow(new Date(message.createdAt), {
          addSuffix: true,
        })}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: (message: SupportMessage) => <MessageActions message={message} />,
  },
];