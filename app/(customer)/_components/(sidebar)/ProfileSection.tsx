"use client";

import { useState } from "react";
import Image from "next/image";
import { User as UserIcon, Image as ImageIcon, Pencil } from "lucide-react";
import { ProfileSectionProps } from "./types";
import ProfileImageEditModal from "./ProfileImageEditModal";
import ProfileEditModal from "./ProfileEditModal";
import CustomerEditForm from "./CustomerEditForm";
import CustomerInfoDisplay from "./CustomerInfoDisplay";

export default function ProfileSection({
  user,
  isCollapsed,
}: ProfileSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState<"view" | "edit" | null>(null);
  const [currentUser, setCurrentUser] = useState(user);

  function handleImagesUpdate({ avatarUrl, backgroundUrl }: { avatarUrl: string | null, backgroundUrl: string | null }) {
    setCurrentUser((prev) => ({
      ...prev,
      avatarUrl,
      backgroundUrl,
    }));
    setModalOpen(false);
  }

  function handleInfoUpdate(updated: typeof user) {
    setCurrentUser(updated);
    setInfoModalOpen(null);
  }

  return (
    <div
      className={`relative flex flex-col items-center w-full overflow-y-auto
        ${isCollapsed ? "py-6 px-2" : "p-6"}`}
      style={{
        borderRadius: "1.5rem",
        boxShadow: "0 6px 32px 0 rgba(0,0,0,0.10)",
        background: "#fff",
        minHeight: isCollapsed ? 220 : 340,
        marginTop: isCollapsed ? 0 : 24,
        maxHeight: "100vh",
      }}
    >
      {/* Background */}
      <div
        className="absolute top-0 left-0 w-full h-32"
        style={{
          background: currentUser.backgroundUrl
            ? undefined
            : "linear-gradient(135deg, #bcd7ec 0%, #f6fafd 100%)",
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
              opacity: 0.6,
            }}
          />
        )}
        {/* Edit background icon */}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="absolute right-4 top-4 bg-white bg-opacity-80 rounded-full p-2 shadow transition hover:bg-teal-100 z-10"
          aria-label="Edit background image"
        >
          <ImageIcon size={20} className="text-teal-600" />
        </button>
      </div>
      {/* Avatar */}
      <div
        className="z-10 relative flex flex-col items-center"
        style={{
          marginTop: 60, // Align with background overlap
        }}
      >
        <div
          style={{
            position: "relative",
            width: isCollapsed ? 56 : 110,
            height: isCollapsed ? 56 : 110,
            marginTop: isCollapsed ? -28 : -60,
            marginBottom: 8,
          }}
        >
          <div
            className="rounded-full bg-slate-200 border-4 border-white shadow"
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
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <UserIcon
                  size={isCollapsed ? 28 : 48}
                  className="text-slate-400"
                />
              </div>
            )}
          </div>
          {/* Edit avatar icon */}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="absolute right-1 bottom-1 bg-white bg-opacity-90 rounded-full shadow p-2 hover:bg-teal-100 z-10"
            aria-label="Edit avatar"
          >
            <Pencil size={18} className="text-teal-600" />
          </button>
        </div>
      </div>
      {/* Customer display name */}
      <div className="text-xl font-semibold text-gray-900 mb-1 mt-2 text-center">
        {currentUser.displayName || "Customer"}
      </div>
      {/* View and Edit buttons */}
      {!isCollapsed && (
        <div className="flex gap-3 mt-4 w-full justify-center">
          <button
            onClick={() => setInfoModalOpen("view")}
            className="px-5 py-2 rounded-full font-medium bg-gray-100 text-teal-700 hover:bg-teal-100 shadow"
            style={{ minWidth: 120 }}
          >
            View
          </button>
          <button
            onClick={() => setInfoModalOpen("edit")}
            className="px-5 py-2 rounded-full font-medium bg-teal-500 text-white hover:bg-teal-400 shadow"
            style={{ minWidth: 120 }}
          >
            Edit
          </button>
        </div>
      )}

      {/* Modal for updating images */}
      <ProfileImageEditModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        avatarUrl={currentUser.avatarUrl ?? null}
        backgroundUrl={currentUser.backgroundUrl ?? null}
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
          <CustomerInfoDisplay user={currentUser} />
        )}
      </ProfileEditModal>
    </div>
  );
}