"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/supabaseClient";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); 
 
 

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { session },
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else if (session) {
      console.log("logged in", session);
    }
  };
 

  return (
    <div className="flex justify-center items-center h-screen">
      <form
        onSubmit={handleLogin}
        className="bg-gray-800 p-8 rounded-lg shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-white">Sign In</h2>
        {error && (
          <div className="bg-red-500 text-white p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-400 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-400 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-gray-500"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
        <p className="text-center text-gray-400 mt-4">
          Don't have an account?{" "}
          <Link href="/auth/register" className="text-blue-500 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
