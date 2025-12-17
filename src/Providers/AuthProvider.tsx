"use client";

import { supabase } from "@/lib/supabase/supabaseClient";
import { Tables } from "@/types/database.types";
import { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export type AuthContextType = {
  session: Session | null;
  userProfile: Tables<"user_profile"> | null;
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

  useEffect(() => {
    // Fetch the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session || null);
    });
  }, []);

  useEffect(() => {
    const { data: authStateListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);

        if (currentSession) {
          // Run the profile logic only if we have a session
          // Using a separate function or ensuring this doesn't block the listener
          fetchOrCreateProfile(currentSession.user);
        } else {
          setUserProfile(null);
        }
      }
    );

    return () => authStateListener.subscription.unsubscribe();
  }, []);

  // Separate the logic to keep the listener clean
  const fetchOrCreateProfile = async (user: any) => {
    try {
      const { data: profile, error } = await supabase
        .from("user_profile")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setUserProfile(profile);
        return;
      }

      // Create if missing
      const { data: newProfile, error: createError } = await supabase
        .from("user_profile")
        .insert([{ id: user.id, username: user.email!.split("@")[0] }])
        .select()
        .single();

      if (newProfile) setUserProfile(newProfile);
    } catch (err) {
      console.error("Profile sync error:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ session, userProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
