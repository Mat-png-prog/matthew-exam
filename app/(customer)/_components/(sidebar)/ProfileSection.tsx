//app/(customer)/_components/(sidebar)/ProfileSection.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { User as UserIcon, Image as ImageIcon, Pencil } from "lucide-react";
import { ProfileSectionProps } from "./types";
import ProfileImageEditModal from "./ProfileImageEditModal";
import ProfileEditModal from "./ProfileEditModal";
import CustomerEditForm from "./CustomerEditForm";
import CustomerInfoDisplay from "./CustomerInfoDisplay";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProfileSection({
  user,
  isCollapsed,
}: ProfileSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState<"view" | "edit" | null>(null);
  const [currentUser, setCurrentUser] = useState(user);
  const { theme } = useTheme();

  function handleImagesUpdate(data: { avatarUrl: string | null, backgroundUrl: string | null}) {
    setCurrentUser((prev) => {
      return {
        ...prev,
        avatarUrl: data.avatarUrl,
        backgroundUrl: data.backgroundUrl,
      };
    });
    setModalOpen(false);
  }

  function handleInfoUpdate(updated: typeof user) {
    setCurrentUser(updated);
    setInfoModalOpen(null);
  }

  // Determine background gradient based on theme
  const getBackgroundStyle = () => {
    if (currentUser.backgroundUrl) return undefined;
    
    if (theme === 'dark') {
      return "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)";
    } else {
      return "linear-gradient(135deg, #bcd7ec 0%, #f6fafd 100%)";
    }
  };

  return (
    <Card
      className={`relative flex flex-col items-center w-full space-y-4
        ${isCollapsed ? "py-4 px-2" : "p-4"}`}
      style={{
        borderRadius: "1.5rem",
        minHeight: isCollapsed ? 200 : 250,
        marginTop: isCollapsed ? 0 : 16,
        maxHeight: "40vh",
      }}
    >
      {/* Background */}
      <div
        className="absolute top-0 left-0 w-full h-40"
        style={{
          background: getBackgroundStyle(),
          zIndex: 1,
        }}
      >
        {currentUser.backgroundUrl && (
          <Image
            src={currentUser.backgroundUrl}
            alt="Profile Background"
            fill
            className="object-cover"
            style={{
              borderTopLeftRadius: "1.5rem",
              borderTopRightRadius: "1.5rem",
              opacity: 0.8,
            }}
            sizes="100vw"
            priority
          />
        )}
        {/* Edit background icon */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setModalOpen(true)}
          className="absolute right-4 top-4 bg-opacity-80 rounded-full p-2 shadow-sm transition hover:bg-primary/20 z-10 dark:bg-slate-800 dark:bg-opacity-70 bg-white"
          aria-label="Edit background image"
        >
          <ImageIcon size={20} className="text-primary" />
        </Button>
      </div>
      {/* Avatar */}
      <div
        className="z-10 relative flex flex-col items-center w-full"
        style={{
          marginTop: 80, // Align with background overlap
        }}
      >
        <div
          style={{
            position: "relative",
            width: isCollapsed ? 64 : 110,
            height: isCollapsed ? 64 : 110,
            marginTop: isCollapsed ? -32 : -70,
            marginBottom: 8,
          }}
          className="mx-auto" // Center horizontally
        >
          <div
            className="rounded-full bg-slate-200 dark:bg-slate-700 border-4 border-background shadow"
            style={{
              width: "100%",
              height: "100%",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {currentUser.avatarUrl ? (
              <Image
                src={currentUser.avatarUrl}
                alt={currentUser.displayName || "User"}
                fill
                className="object-cover"
                sizes="(max-width: 110px) 100vw, 110px"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <UserIcon
                  size={isCollapsed ? 32 : 48}
                  className="text-slate-400 dark:text-slate-300"
                />
              </div>
            )}
          </div>
          {/* Edit avatar icon */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setModalOpen(true)}
            className="absolute right-0 bottom-0 bg-white dark:bg-slate-800 bg-opacity-90 dark:bg-opacity-90 rounded-full shadow p-2 hover:bg-primary/20 dark:hover:bg-primary/20 z-10"
            aria-label="Edit avatar"
          >
            <Pencil size={18} className="text-primary" />
          </Button>
        </div>
      </div>
      {/* Customer display name */}
      <div className="text-xl font-semibold text-foreground mt-1 text-center">
        {currentUser.displayName || "Customer"}
      </div>
      {/* View and Edit buttons */}
      {!isCollapsed && (
        <div className="flex gap-1 mt-3 w-full h-1 justify-center">
          <Button
            onClick={() => setInfoModalOpen("view")}
            variant="outline"
            className="rounded-full font-medium"
            style={{ minWidth: 120 }}
          >
            View
          </Button>
          <Button
            onClick={() => setInfoModalOpen("edit")}
            variant="default"
            className="rounded-full font-medium"
            style={{ minWidth: 120 }}
          >
            Edit
          </Button>
        </div>
      )}

      {/* Modal for updating images */}
      <ProfileImageEditModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        avatarUrl={currentUser.avatarUrl}
        backgroundUrl={currentUser.backgroundUrl}
        displayName={currentUser.displayName}
        onUpdate={handleImagesUpdate}
      />
      {/* Modal for viewing/editing info */}
      <ProfileEditModal
        isOpen={!!infoModalOpen}
        onClose={() => setInfoModalOpen(null)}
        mode={infoModalOpen === "edit" ? "edit" : "view"}
        onModeChange={m => setInfoModalOpen(m)}
      >
        {infoModalOpen === "edit" ? (
          <CustomerEditForm user={currentUser} onUpdate={handleInfoUpdate} onCancel={() => setInfoModalOpen(null)} />
        ) : (
          <CustomerInfoDisplay user={currentUser} viewMode="detailed" />
        )}
      </ProfileEditModal>
    </Card>
  );
}