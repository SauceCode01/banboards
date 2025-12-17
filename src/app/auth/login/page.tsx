"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/supabaseClient";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthContext } from "@/Providers/AuthProvider";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const { authState } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (authState === 'authenticated') {
      router.push("/workspaces");
    }
  }, [authState, router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);

    const { data: { session }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setFormLoading(false);

    if (error) {
      setError(error.message);
    } else if (session) {
      router.push("/workspaces");
    }
  };

  if (authState !== 'unauthenticated') {
    return (
        <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
        </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] flex items-center justify-center p-4 pt-24 md:pt-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-indigo-500/10">
          <h2 className="text-3xl font-bold text-center text-white mb-2">
            Welcome Back
          </h2>
          <p className="text-center text-slate-400 mb-8">
            Sign in to continue to your workspace.
          </p>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg mb-6 text-center text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-slate-300 mb-2 text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/60 text-white rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                required
                disabled={formLoading}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-slate-300 mb-2 text-sm font-medium">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/60 text-white rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                required
                disabled={formLoading}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all duration-300 disabled:bg-slate-700 disabled:cursor-not-allowed"
              disabled={formLoading}
            >
              {formLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>
          
          <p className="text-center text-slate-400 mt-6">
            Don't have an account?
            <Link href="/auth/register" className="text-indigo-400 hover:text-indigo-300 font-medium ml-2 transition">
              Register
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}