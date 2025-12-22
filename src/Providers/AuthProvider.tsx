"use client";

import { supabase } from "@/lib/supabase/supabaseClient";
import { Tables } from "@/types/database.types";
import { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

export type AuthState = "initiating" | "authenticated" | "unauthenticated";

export type AuthContextType = {
  session: Session | null;
  userProfile: Tables<"user_profile"> | null;
  authState: AuthState;
  avatarUrl: string | null;
  refreshUserProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<Tables<"user_profile"> | null>(
    null
  );
  const [authState, setAuthState] = useState<AuthState>("initiating");
  // No longer need separate avatarUrl state, it will come from userProfile
  // const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // console.log("AuthProvider", { session, userProfile, authState });

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log(`Auth event: ${event}`);

        if (currentSession) {
          // 2. Set everything at once (Batching)
          setSession(currentSession);
          setAuthState("authenticated");
        } else {
          // Handle Logout
          setSession(null);
          setAuthState("unauthenticated");
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    loadProfile();
  }, [session]);

  const loadProfile = async () => {
    if (!session) {
      setUserProfile(null);
      // setAvatarUrl(null); // No longer needed
      return;
    }
    const profile = await getProfileData(session.user);
    setUserProfile(profile);
  };

  // Expose a refresh helper for pages (e.g., after avatar upload)
  async function refreshUserProfile() {
    console.log("Refreshing user profile...");
    // No longer need to call loadAvatar separately
    await loadProfile();
  }

  // React to realtime updates on user_profile for current user
  useEffect(() => {
    if (!session?.user?.id) return;
    const channel = supabase.channel("schema-db-changes-user_profile");

    channel.on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "user_profile",
        filter: `id=eq.${session.user.id}`,
      },
      (payload) => {
        const next = payload.new as Tables<"user_profile">;
        setUserProfile(next);
      }
    );

    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "user_profile",
        filter: `id=eq.${session.user.id}`,
      },
      (payload) => {
        const next = payload.new as Tables<"user_profile">;
        setUserProfile(next);
      }
    );

    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  const value: AuthContextType = {
    session,
    userProfile,
    authState,
    avatarUrl: userProfile?.photo_url || null, // Get avatar from profile
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Helper function just returns data, doesn't touch state
const getProfileData = async (
  user: User
): Promise<Tables<"user_profile"> | null> => {
  try {
    // 1. Try to fetch
    console.log("Fetching profile...", user);

    const { data: profile, error } = await supabase
      .from("user_profile")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    // console.log("Fetched profile:", profile);

    if (profile) return profile;

    // 2. If not found, create
    console.log("Profile not found, creating...");
    if (!profile && (!error || error.code === "PGRST116")) {
      const { data: newProfile, error: createError } = await supabase
        .from("user_profile")
        .insert([
          {
            id: user.id,
            username: user.email!.split("@")[0],
            email: user.email!,
          },
        ])
        .select()
        .single();

      if (newProfile) return newProfile;
    }
  } catch (err) {
    console.error("Error loading profile:", err);
  }
  return null;
};
