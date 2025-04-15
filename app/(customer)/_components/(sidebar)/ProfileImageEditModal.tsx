"use client";
import { useState } from "react";
import Image from "next/image";
import { User as UserIcon, Pencil, Image as ImageIcon, X } from "lucide-react";
import { motion } from "framer-motion";
import { useImagesPreview } from "./useImagePreview";
import { uploadAvatar, uploadBackground } from "./_profile-actions/profile-upload";
import { toast } from "sonner";

export default function ProfileImageEditModal({
  isOpen,
  onClose,
  avatarUrl,
  backgroundUrl,
  displayName,
  onUpdate,
}: {
  isOpen: boolean;
  onClose: () => void;
  avatarUrl: string | null;
  backgroundUrl: string | null;
  displayName?: string | null;
  onUpdate: (urls: { avatarUrl: string | null; backgroundUrl: string | null }) => void;
}) {
  const avatar = useImagesPreview(avatarUrl ?? null);
  const bg = useImagesPreview(backgroundUrl ?? null);

  const [isSaving, setIsSaving] = useState(false);
  const [avatarDragActive, setAvatarDragActive] = useState(false);
  const [bgDragActive, setBgDragActive] = useState(false);

  const handleAvatarDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setAvatarDragActive(e.type === "dragover");
  };
  const handleBgDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setBgDragActive(e.type === "dragover");
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!avatar.selectedFile && !bg.selectedFile) {
      toast.error("Please select at least one image to upload");
      return;
    }
    setIsSaving(true);
    let newAvatarUrl: string | null = avatarUrl;
    let newBgUrl: string | null = backgroundUrl;

    if (avatar.selectedFile) {
      const formData = new FormData();
      formData.append("avatar", avatar.selectedFile);
      const result = await uploadAvatar(formData);
      if (result.success && result.avatarUrl) {
        newAvatarUrl = result.avatarUrl;
      } else {
        toast.error(result.error || "Failed to upload avatar");
        setIsSaving(false);
        return;
      }
    }
    if (bg.selectedFile) {
      const formData = new FormData();
      formData.append("background", bg.selectedFile);
      const result = await uploadBackground(formData);
      if (result.success && result.imageUrl) {
        newBgUrl = result.imageUrl;
      } else {
        toast.error(result.error || "Failed to upload background");
        setIsSaving(false);
        return;
      }
    }
    onUpdate({ avatarUrl: newAvatarUrl, backgroundUrl: newBgUrl });
    toast.success("Images updated!");
    setIsSaving(false);
    avatar.resetImage();
    bg.resetImage();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 z-10 max-h-[95vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>
        <div className="overflow-y-auto p-6 pt-10">
          {/* Sidebar-style info at top */}
          <div className="relative flex flex-col items-center mb-8">
            {/* Background image */}
            <div
              className="absolute top-0 left-0 w-full h-32"
              style={{
                background: bg.previewUrl
                  ? undefined
                  : "linear-gradient(135deg, #bcd7ec 0%, #f6fafd 100%)",
                zIndex: 1,
                borderTopLeftRadius: "1.5rem",
                borderTopRightRadius: "1.5rem",
                overflow: "hidden",
              }}
            >
              {bg.previewUrl && (
                <Image
                  src={bg.previewUrl}
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
            </div>
            {/* Avatar overlaps background */}
            <div
              className="z-10 relative flex flex-col items-center"
              style={{ marginTop: 60 }}
            >
              <div
                style={{
                  position: "relative",
                  width: 110,
                  height: 110,
                  marginTop: -60,
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
                  {avatar.previewUrl ? (
                    <Image
                      src={avatar.previewUrl}
                      alt={displayName || "User"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserIcon size={48} className="text-slate-400" />
                    </div>
                  )}
                </div>
              </div>
              <div className="text-xl font-semibold text-gray-900 mb-1">
                {displayName || "Customer"}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-7">
            {/* Background drag-and-drop */}
            <motion.div
              className={`relative border-2 rounded-xl p-5 flex flex-col items-center justify-center group transition
                ${bgDragActive ? "border-teal-500 bg-teal-50" : "border-gray-200 bg-gray-50"}
              `}
              onDragOver={handleBgDrag}
              onDragEnter={handleBgDrag}
              onDragLeave={handleBgDrag}
              onDrop={(e) => {
                setBgDragActive(false);
                bg.handleDrop(e);
              }}
              whileHover={{ scale: 1.02, boxShadow: "0 0 0 2px #14b8a6" }}
              tabIndex={0}
              aria-label="Background image upload area"
            >
              <span className="absolute left-4 top-4 text-xs text-gray-500 font-semibold">Background Image</span>
              <label className="w-full flex flex-col items-center cursor-pointer">
                <ImageIcon size={32} className="text-teal-600 mb-2" />
                <span className="text-base font-medium mb-1">
                  {bg.selectedFile ? bg.selectedFile.name : "Drag & drop or click to upload"}
                </span>
                <span className="text-xs text-gray-500 text-center">
                  {bg.selectedFile
                    ? "Image ready to upload"
                    : "Recommended: landscape image, JPG/PNG/WebP/SVG/BMP/TIFF, max 5MB"}
                </span>
                <input
                  type="file"
                  onChange={bg.handleInputChange}
                  accept="image/*"
                  className="hidden"
                  disabled={isSaving}
                  aria-label="Upload background image"
                />
              </label>
              {bg.previewUrl && (
                <Image
                  src={bg.previewUrl}
                  alt="Background Preview"
                  width={320}
                  height={70}
                  className="rounded-lg mt-5 border border-gray-200 object-cover"
                  style={{ maxHeight: 70, objectFit: "cover", width: "100%" }}
                />
              )}
            </motion.div>

            {/* Avatar drag-and-drop */}
            <motion.div
              className={`relative border-2 rounded-xl p-5 flex flex-col items-center justify-center group transition
                ${avatarDragActive ? "border-teal-500 bg-teal-50" : "border-gray-200 bg-gray-50"}
              `}
              onDragOver={handleAvatarDrag}
              onDragEnter={handleAvatarDrag}
              onDragLeave={handleAvatarDrag}
              onDrop={(e) => {
                setAvatarDragActive(false);
                avatar.handleDrop(e);
              }}
              whileHover={{ scale: 1.02, boxShadow: "0 0 0 2px #14b8a6" }}
              tabIndex={0}
              aria-label="Avatar image upload area"
            >
              <span className="absolute left-4 top-4 text-xs text-gray-500 font-semibold">Avatar Image</span>
              <label className="w-full flex flex-col items-center cursor-pointer">
                <Pencil size={32} className="text-teal-600 mb-2" />
                <span className="text-base font-medium mb-1">
                  {avatar.selectedFile ? avatar.selectedFile.name : "Drag & drop or click to upload"}
                </span>
                <span className="text-xs text-gray-500 text-center">
                  {avatar.selectedFile
                    ? "Image ready to upload"
                    : "Recommended: square image, JPG/PNG/WebP/SVG/BMP/TIFF, max 5MB"}
                </span>
                <input
                  type="file"
                  onChange={avatar.handleInputChange}
                  accept="image/*"
                  className="hidden"
                  disabled={isSaving}
                  aria-label="Upload avatar image"
                />
              </label>
              {avatar.previewUrl && (
                <Image
                  src={avatar.previewUrl}
                  alt="Avatar Preview"
                  width={72}
                  height={72}
                  className="rounded-full mt-5 border border-gray-200 object-cover"
                  style={{ maxHeight: 72, objectFit: "cover" }}
                />
              )}
            </motion.div>

            {/* Submit/cancel */}
            <div className="flex gap-2 mt-4 justify-center">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2 px-4 rounded bg-gray-200 text-gray-700 font-medium hover:bg-gray-300"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2 px-4 rounded bg-teal-500 text-white font-medium hover:bg-teal-400"
                disabled={isSaving || (!avatar.selectedFile && !bg.selectedFile)}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}