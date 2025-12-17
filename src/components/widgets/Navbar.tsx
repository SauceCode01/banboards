"use client";

import { supabase } from "@/lib/supabase/supabaseClient";
import { useAuthContext } from "@/Providers/AuthProvider";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";

const Navbar = () => {
  const { session, userProfile } = useAuthContext();

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-2xl font-bold">
          BanBoards
        </Link>
        {userProfile && (
          <div className="text-white">
            Signed in as:{" "}
            <span className="font-bold">{userProfile?.username}</span>
          </div>
        )}
        <div className="space-x-4">
          <Link href="/auth/login" className="text-gray-300 hover:text-white">
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="text-gray-300 hover:text-white"
          >
            Register
          </Link>
          <Link href="/" className="text-gray-300 hover:text-white">
            Home
          </Link>
          <Link href="/posts" className="text-gray-300 hover:text-white">
            Posts
          </Link>
          <Link href="/workspaces" className="text-gray-300 hover:text-white">
            Workspaces
          </Link>
          <Link href="/auth/logout" className="text-gray-300 hover:text-white">
            Logout
          </Link>
          <Link href="/profiles" className="text-gray-300 hover:text-white">
            Profiles
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
