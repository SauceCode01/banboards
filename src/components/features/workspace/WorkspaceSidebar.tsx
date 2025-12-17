"use client";
import { supabase } from "@/lib/supabase/supabaseClient";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/Providers/AuthProvider";
import { useWorkspaceContext } from "@/Providers/WorkspaceProvider";
import { Tables, TablesInsert } from "@/types/database.types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const WorkspaceSidebar = () => {
  const { userProfile } = useAuthContext();
  const router = useRouter();
  const [newWorkspaceTitle, setNewWorkspaceTitle] = useState("");

  const {
    workspaceId,
    setWorkspaceId,
    workspaces,
    setWorkspaces,
    loadingWorkspaces,
    createNewWorkspace,
    loadingCreateWorkspace,
  } = useWorkspaceContext();

  const handleCreateWorkspace = async () => {
    const newWorkspace = await createNewWorkspace(newWorkspaceTitle);

    if (!newWorkspace) return;
    setNewWorkspaceTitle("");
    router.push(`/workspaces/${newWorkspace.id}`);
  };

  return (
    <div className="w-64 bg-gray-800 text-white p-4 flex flex-col">
      <h2 className="text-lg font-bold mb-4">Workspaces</h2>
      {loadingWorkspaces && <p>Loading...</p>}
      <ul>
        {workspaces.map((workspace) => (
          <li key={workspace.id} className="mb-2 w-full">
            <Link
              href={`/workspaces/${workspace.id}`}
              className={cn(
                "hover:text-gray-300 w-full block",
                workspaceId === workspace.id && "text-gray-300 bg-gray-600"
              )}
            >
              {workspace.title}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-auto">
        <input
          type="text"
          value={newWorkspaceTitle}
          onChange={(e) => setNewWorkspaceTitle(e.target.value)}
          placeholder="New workspace title"
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
        <button
          onClick={handleCreateWorkspace}
          className="w-full mt-2 p-2 bg-blue-600 hover:bg-blue-700 rounded"
        >
          Create Workspace
        </button>
      </div>
    </div>
  );
};

export default WorkspaceSidebar;
