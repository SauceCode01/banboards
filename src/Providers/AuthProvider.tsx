"use client";

import { supabase } from "@/lib/supabase/supabaseClient";
import { Tables } from "@/types/database.types";
import { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

export type AuthState = 'initiating' | 'authenticated' | 'unauthenticated';

export type AuthContextType = {
  session: Session | null;
  userProfile: Tables<"user_profile"> | null;
  authState: AuthState;
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
  const [userProfile, setUserProfile] = useState<Tables<"user_profile"> | null>(null);
  const [authState, setAuthState] = useState<AuthState>('initiating');

  useEffect(() => {
    const { data: authStateListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (currentSession) {
          // If a session exists, we are potentially authenticated,
          // but we need to fetch the profile first.
          setSession(currentSession);
          await fetchOrCreateProfile(currentSession.user);
          setAuthState('authenticated');
        } else {
          // If no session, we are unauthenticated.
          setSession(null);
          setUserProfile(null);
          setAuthState('unauthenticated');
        }
      }
    );

    return () => authStateListener.subscription.unsubscribe();
  }, []);

  const fetchOrCreateProfile = async (user: User) => {
    try {
      // First, try to fetch the profile
      const { data: profile, error } = await supabase
        .from("user_profile")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setUserProfile(profile);
        return;
      }

      if (error && error.code !== 'PGRST116') { // PGRST116 is 'exact-single-row-not-found'
        throw error;
      }
      
      // If no profile, create one
      const { data: newProfile, error: createError } = await supabase
        .from("user_profile")
        .insert([{ id: user.id, username: user.email!.split("@")[0], email: user.email! }])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      setUserProfile(newProfile);

    } catch (err) {
      console.error("Error fetching or creating user profile:", err);
      // Even if profile fails, user is still logged in. Handle accordingly.
      // For now, we'll leave profile as null.
      setUserProfile(null);
    }
  };

  const value: AuthContextType = {
    session,
    userProfile,
    authState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};