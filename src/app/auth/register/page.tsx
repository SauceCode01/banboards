"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/supabaseClient";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, LayoutDashboard, ListTodo, ShieldCheck, Loader2 } from "lucide-react";
import { useAuthContext } from "@/Providers/AuthProvider";
import React from "react";

type FeatureListItemProps = {
    icon: React.ElementType;
    title: string;
    description: string;
};

const FeatureListItem = ({ icon, title, description }: FeatureListItemProps) => {
    const Icon = icon;
    return (
        <div className="flex items-start gap-4">
            <div className="mt-1 bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                <Icon className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
                <h4 className="font-semibold text-white">{title}</h4>
                <p className="text-slate-400 text-sm mt-1">{description}</p>
            </div>
        </div>
    );
};

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const router = useRouter();
  const { authState } = useAuthContext();

  useEffect(() => {
    if (authState === 'authenticated') {
      router.push("/workspaces");
    }
  }, [authState, router]);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setFormLoading(false);

    if (error) {
      setError(error.message);
    } else {
      toast.success(
        "Registration successful! Please check your email to confirm your account."
      );
      router.push("/auth/login");
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
        className="w-full max-w-4xl bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-2xl shadow-2xl shadow-indigo-500/10 overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Features */}
          <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-slate-800">
            <h2 className="text-2xl font-bold text-white mb-4">
                Join the Future of Collaboration
            </h2>
            <p className="text-slate-400 mb-8">
                Create an account to start organizing your projects in workspaces, boards, and tasks.
            </p>
            <div className="space-y-6">
                <FeatureListItem 
                    icon={LayoutDashboard}
                    title="Flexible Structure"
                    description="Organize everything in Workspaces and Boards for any project."
                />
                <FeatureListItem 
                    icon={ListTodo}
                    title="Dynamic Workflow"
                    description="Use customizable Lists and Items to build the perfect workflow."
                />
                <FeatureListItem 
                    icon={Users}
                    title="Real-time Teamwork"
                    description="Invite collaborators and see changes happen live."
                />
                <FeatureListItem 
                    icon={ShieldCheck}
                    title="Secure and Reliable"
                    description="Your data is safe with us. We use enterprise-grade security."
                />
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="p-8 md:p-12">
            <h2 className="text-3xl font-bold text-center text-white mb-2">
              Create an Account
            </h2>
            <p className="text-center text-slate-400 mb-8">
              Get started for free. No credit card required.
            </p>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg mb-6 text-center text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister}>
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
                {formLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
            
            <p className="text-center text-slate-400 mt-6">
              Already have an account?
              <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-medium ml-2 transition">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
