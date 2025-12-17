"use client";

import { supabase } from "@/lib/supabase/supabaseClient";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
};

export const AuthenticatedOnly = (props: Props) => {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      if (!session?.user) {
        router.push("/auth/login");
      }
    });

    // Fetch the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => {
      data?.subscription.unsubscribe();
    };
  }, []);

  if (user) return <>{props.children}</>;
  else return <>Redirecting to login page.</>;
};
