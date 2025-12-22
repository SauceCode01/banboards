"use client";

import React, { useEffect, useState } from "react";
import { useAuthContext } from "@/Providers/AuthProvider";
import { supabase } from "@/lib/supabase/supabaseClient";
import { useRouter } from "next/navigation";

export default function ProfileSettingsPage() {
  const { session, userProfile, refreshUserProfile, avatarUrl } = useAuthContext();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUsername(userProfile?.username || "");
  }, [userProfile?.username]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!session?.user) return;
    setSaving(true);

    try {
      let newAvatarUrl = userProfile?.photo_url;

      // 1. Upload avatar if a new one is selected
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop()?.toLowerCase() || "png";
        // Create a unique filename to avoid caching issues
        const filePath = `${session.user.id}/avatar-${Date.now()}.${ext}`;
        
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile, { upsert: true, contentType: avatarFile.type });
        
        if (uploadError) throw new Error("Failed to upload new avatar.");

        // Get the public URL of the newly uploaded file
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
        if (!urlData.publicUrl) {
          throw new Error("Could not get public URL for avatar.");
        }
        newAvatarUrl = urlData.publicUrl;
      }

      // 2. Update user_profile with new username and/or avatar URL
      const updates: { username: string; photo_url?: string } = {
        username,
      };
      if (newAvatarUrl !== userProfile?.photo_url) {
        updates.photo_url = newAvatarUrl || undefined;
      }

      if (username !== userProfile?.username || newAvatarUrl !== userProfile?.photo_url) {
        const { error: updateError } = await supabase
          .from("user_profile")
          .update(updates)
          .eq("id", session.user.id);
        if (updateError) throw new Error("Failed to update profile.");
      }

      // 3. Refresh context and redirect
      await refreshUserProfile();
      router.push("/profile");

    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    // No need to set a local URL state, we'll use a temporary one for preview
  }

  const previewUrl = avatarFile ? URL.createObjectURL(avatarFile) : avatarUrl;

  return (
    <section className="py-8">
      <div className="mx-auto max-w-3xl">
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 space-y-6">
          <h1 className="text-2xl font-bold text-white">Profile Settings</h1>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center ring-1 ring-slate-700">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-slate-400 text-xs">No Avatar</span>
              )}
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">Change Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={saving}
                className="text-sm text-slate-300"
              />
            </div>
          </div>

          <form onSubmit={saveProfile} className="space-y-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-slate-100 text-sm"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Email</label>
              <input
                value={userProfile?.email || ""}
                readOnly
                className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-slate-400 text-sm"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-md"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
