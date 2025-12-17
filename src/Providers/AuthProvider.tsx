"use client";

import { supabase } from "@/lib/supabase/supabaseClient";
import { Tables } from "@/types/database.types";
import { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

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

    // set up auth listener
    const { data: authStateListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session) {
          setSession(null);
          setUserProfile(null);
          return;
        }

        setSession(session);
        // setting user profile
        let userProfile: null | Tables<"user_profile"> = null;

        // check if profile exists
        const { data: existingProfile, error } = await supabase
          .from("user_profile")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (existingProfile) {
          userProfile = existingProfile;
        }

        // if no profile, create one
        if (!userProfile) {
          const { data: newProfile, error: newProfileError } = await supabase
            .from("user_profile")
            .insert([
              {
                id: session.user.id,
                username: session.user.email!.split("@")[0],
              },
            ])
            .select()
            .maybeSingle();

          if (newProfile) {
            userProfile = newProfile;
          }
        }

        // set userProfile state
        if (userProfile) {
          setUserProfile(userProfile);
        }
      }
    );

    // unsubscribe auth listener on unmount
    return () => {
      authStateListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, userProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
