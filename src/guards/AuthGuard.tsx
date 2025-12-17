"use client";

import { useAuthContext } from "@/Providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { authState } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    // If the check is complete and the user is unauthenticated, redirect to login.
    if (authState === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [authState, router]);

  // While the auth state is being determined, or if the user is unauthenticated
  // and the redirect is in progress, show a loading spinner.
  if (authState !== 'authenticated') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // If the user is authenticated, render the children.
  return <>{children}</>;
}
