"use client";

import React from "react";
import { useAuthContext } from "@/Providers/AuthProvider";
import { useWorkspaceContext } from "@/Providers/WorkspaceProvider";
import Link from "next/link";

export default function ProfilePage() {
  const { userProfile, avatarUrl } = useAuthContext();
  const { workspaces, workspacesState } = useWorkspaceContext();

  const workspaceCount = workspaces?.length ?? 0;

  return (
    <section className="py-8">
      <div className="mx-auto max-w-4xl">
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center ring-1 ring-slate-700">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-slate-400 text-xs">No Avatar</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{userProfile?.username || "User"}</h1>
              <p className="text-slate-400">{userProfile?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-slate-300 mb-2">Account</h2>
              <p className="text-sm text-slate-400">Username: <span className="text-white">{userProfile?.username}</span></p>
              <p className="text-sm text-slate-400">Email: <span className="text-white">{userProfile?.email}</span></p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-slate-300 mb-2">Status</h2>
              <p className="text-sm text-slate-400">Logged in</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-slate-300 mb-2">Workspaces</h2>
              <p className="text-sm text-slate-400">You have <span className="text-white font-semibold">{workspaceCount}</span> workspace{workspaceCount === 1 ? "" : "s"}.</p>
              <div className="mt-3">
                <Link href="/workspaces" className="text-xs text-indigo-300 hover:text-indigo-200">Manage Workspaces →</Link>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-semibold text-slate-300 mb-2">Recent Workspaces</h2>
            {workspacesState === "loading" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-slate-800/50 border border-slate-700 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : workspaceCount > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {workspaces.slice(0, 6).map((ws) => (
                  <div key={ws.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{ws.title}</p>
                      <p className="text-xs text-slate-400">{ws.description || "No description"}</p>
                    </div>
                    <Link href={`/workspaces/${ws.id}/boards`} className="text-xs px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Open</Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-400">No workspaces yet. <Link href="/workspaces" className="text-indigo-300 hover:text-indigo-200">Create one →</Link></div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
