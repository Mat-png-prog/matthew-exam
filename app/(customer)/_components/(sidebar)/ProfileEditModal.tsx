//app/(customer)/_components/(sidebar)/ProfileEditModal.tsx
"use client";
import { useEffect, ReactNode } from "react";
import { X } from "lucide-react";
import { EditMode } from "./types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  mode: EditMode;
  onModeChange: (mode: EditMode) => void;
}

export default function ProfileEditModal({
  isOpen,
  onClose,
  children,
  mode,
  onModeChange,
}: ProfileEditModalProps) {
  // Close modal with Escape key
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[75vh] flex flex-col">
        
        {/* Tab navigation */}
        <div className="flex justify-center gap-2 mt-4 mb-2">
          <Button
            onClick={() => onModeChange("view")}
            variant={mode === "view" ? "default" : "outline"}
            className="rounded-full font-medium"
            style={{ minWidth: 120 }}
          >
            View
          </Button>
          <Button
            onClick={() => onModeChange("edit")}
            variant={mode === "edit" ? "default" : "outline"}
            className="rounded-full font-medium"
            style={{ minWidth: 120 }}
          >
            Edit
          </Button>
        </div>
        
        {/* Modal content - SCROLLABLE */}
        <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
      </DialogContent>
    </Dialog>
  );
}