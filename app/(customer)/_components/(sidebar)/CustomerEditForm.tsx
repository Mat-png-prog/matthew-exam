"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { User as UserIcon, Image as ImageIcon, Pencil } from "lucide-react";
import { User } from "./types";
import { uploadBackground, uploadAvatar } from "./_profile-actions/profile-upload";
import { toast } from "sonner";

export default function CustomerEditForm({
  user,
  onUpdate,
  onCancel,
}: {
  user: User;
  onUpdate: (updated: User) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<User>(user);
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl || null);
  const [bgPreview, setBgPreview] = useState<string | null>(user.backgroundUrl || null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  // Handle changes to text inputs
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Handle avatar file selection
  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;
    setAvatarFile(e.target.files[0]);
    const url = URL.createObjectURL(e.target.files[0]);
    setAvatarPreview(url);
  }

  // Handle background file selection
  function handleBgChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;
    setBgFile(e.target.files[0]);
    const url = URL.createObjectURL(e.target.files[0]);
    setBgPreview(url);
  }

  // Save all changes (handles avatar and background uploads if changed)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    let avatarUrl = form.avatarUrl;
    let backgroundUrl = form.backgroundUrl;

    // Upload new avatar if chosen
    if (avatarFile) {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      if (user.avatarUrl) formData.append("previousUrl", user.avatarUrl);
      const result = await uploadAvatar(formData);
      if (result.success && result.avatarUrl) {
        avatarUrl = result.avatarUrl;
      } else {
        toast.error(result.error || "Failed to upload avatar");
        setIsSaving(false);
        return;
      }
    }

    // Upload new background if chosen
    if (bgFile) {
      const formData = new FormData();
      formData.append("background", bgFile);
      if (user.backgroundUrl) formData.append("previousUrl", user.backgroundUrl);
      const result = await uploadBackground(formData);
      if (result.success && result.imageUrl) {
        backgroundUrl = result.imageUrl;
      } else {
        toast.error(result.error || "Failed to upload background");
        setIsSaving(false);
        return;
      }
    }

    onUpdate({ ...form, avatarUrl, backgroundUrl });
    toast.success("Profile updated!");
    setIsSaving(false);
  }

  // --- UI starts here ---
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sidebar-style top info with avatar and background */}
      <div className="relative flex flex-col items-center w-full mb-4 border-b pb-6">
        {/* Background image or default color */}
        <div
          className="absolute top-0 left-0 w-full h-32"
          style={{
            background: bgPreview
              ? undefined
              : "linear-gradient(135deg, #bcd7ec 0%, #f6fafd 100%)",
            zIndex: 1,
            borderTopLeftRadius: "1.5rem",
            borderTopRightRadius: "1.5rem",
            overflow: "hidden",
          }}
        >
          {bgPreview && (
            <Image
              src={bgPreview}
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
            onClick={() => bgInputRef.current?.click()}
            className="absolute right-4 top-4 bg-white bg-opacity-80 rounded-full p-2 shadow transition hover:bg-teal-100 z-10"
            aria-label="Change background image"
          >
            <ImageIcon size={20} className="text-teal-600" />
          </button>
          <input
            ref={bgInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBgChange}
            disabled={isSaving}
          />
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
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt={form.displayName || "User"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserIcon size={48} className="text-slate-400" />
                </div>
              )}
            </div>
            {/* Edit avatar icon */}
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute right-1 bottom-1 bg-white bg-opacity-90 rounded-full shadow p-2 hover:bg-teal-100 z-10"
              aria-label="Change avatar"
            >
              <Pencil size={18} className="text-teal-600" />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={isSaving}
            />
          </div>
          <div className="text-xl font-semibold text-gray-900 mb-1">
            {form.displayName || "Customer"}
          </div>
        </div>
      </div>

      {/* Form fields - spaced out in a grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(form).map(([key, value]) =>
          key === "id" || key === "avatarUrl" || key === "backgroundUrl" ? null : (
            <div key={key} className="flex flex-col">
              <label className="block text-gray-700 font-medium mb-1 capitalize">{key}</label>
              <input
                name={key}
                value={value || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                disabled={isSaving}
                autoComplete="off"
              />
            </div>
          )
        )}
      </div>
      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="w-1/2 py-2 px-4 rounded bg-gray-200 text-gray-700 font-medium hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="w-1/2 py-2 px-4 rounded bg-teal-500 text-white font-medium hover:bg-teal-400"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}