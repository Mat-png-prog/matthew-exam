"use client";
import { useEffect, ReactNode } from "react";
import { X } from "lucide-react";
import { EditMode } from "./types";

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal container with max height and scroll */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 z-10 max-h-[90vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>
        {/* Tab navigation */}
        <div className="flex justify-center gap-2 mt-8 mb-2">
          <button
            onClick={() => onModeChange("view")}
            className={`px-4 py-2 rounded-full font-medium transition
              ${mode === "view"
                ? "bg-teal-500 text-white shadow"
                : "bg-gray-100 text-gray-700 hover:bg-teal-100"}
            `}
            style={{ minWidth: 120 }}
          >
            View
          </button>
          <button
            onClick={() => onModeChange("edit")}
            className={`px-4 py-2 rounded-full font-medium transition
              ${mode === "edit"
                ? "bg-teal-500 text-white shadow"
                : "bg-gray-100 text-gray-700 hover:bg-teal-100"}
            `}
            style={{ minWidth: 120 }}
          >
            Edit
          </button>
        </div>
        {/* Modal content - SCROLLABLE */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}