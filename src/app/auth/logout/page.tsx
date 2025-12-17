"use client";

import { supabase } from "@/lib/supabase/supabaseClient";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const LogoutPage = () => {
  const router = useRouter();
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      // Optional: Redirect user or show a success toast
      router.push("/auth/login");
    }
  };

  useEffect(() => {
    handleLogout();
  }, []);

  return <div>Logging you out</div>;
};

export default LogoutPage;
