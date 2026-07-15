"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { uploadAvatar } from "@/api/userApi";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";

const MAX_AVATAR_BYTES = 8 * 1024 * 1024;

export default function AccountSettingsPage() {
  const { user, authFetch, updateUser, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_AVATAR_BYTES) {
      setError("Image exceeds the 8MB limit.");
      toast("Image exceeds the 8MB limit.", "error");
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const updatedUser = await uploadAvatar(authFetch, file);
      updateUser(updatedUser);
      toast("Profile photo updated.", "success");
    } catch {
      setError("Couldn't upload your photo. Try again.");
      toast("Couldn't upload your photo. Try again.", "error");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      toast("Signed out.", "success");
      router.push("/");
    } catch {
      toast("Couldn't sign out. Try again.", "error");
      setIsLoggingOut(false);
    }
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-extrabold uppercase tracking-tight text-ink-on-sand">
        Account Settings
      </h1>

      <div className="mt-6 max-w-md rounded-lg border border-ink-on-sand/10 bg-white/40 p-5">
        <p className="font-[family-name:var(--font-barlow)] text-xs font-semibold uppercase tracking-widest text-muted-on-sand">
          Profile Picture
        </p>
        <div className="mt-2 flex items-center gap-4">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-on-sand/10">
            {user?.avatar_url ? (
              <Image src={user.avatar_url} alt={user.name} fill className="object-cover" sizes="64px" unoptimized />
            ) : (
              <span className="font-[family-name:var(--font-barlow-condensed)] text-xl font-bold uppercase text-ink-on-sand">
                {user?.name?.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="rounded-md border border-ink-on-sand/30 px-4 py-2 font-[family-name:var(--font-barlow)] text-xs font-semibold uppercase text-ink-on-sand hover:bg-ink-on-sand/5 disabled:opacity-50"
            >
              {isUploading ? "Uploading..." : "Change photo"}
            </button>
            {error && (
              <p className="mt-1 font-[family-name:var(--font-barlow)] text-xs text-red-urgent">{error}</p>
            )}
          </div>
        </div>

        <p className="mt-5 font-[family-name:var(--font-barlow)] text-xs font-semibold uppercase tracking-widest text-muted-on-sand">
          Name
        </p>
        <p className="mt-1 font-[family-name:var(--font-barlow)] text-sm text-ink-on-sand">{user?.name}</p>

        <p className="mt-4 font-[family-name:var(--font-barlow)] text-xs font-semibold uppercase tracking-widest text-muted-on-sand">
          Email
        </p>
        <p className="mt-1 font-[family-name:var(--font-barlow)] text-sm text-ink-on-sand">{user?.email}</p>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="mt-6 rounded-md border border-red-urgent/30 px-4 py-2 font-[family-name:var(--font-barlow)] text-xs font-semibold uppercase text-red-urgent hover:bg-red-urgent/10 disabled:opacity-50"
        >
          {isLoggingOut ? "Signing out..." : "Log out"}
        </button>
      </div>
    </div>
  );
}
