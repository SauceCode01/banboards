"use client";
import { supabase } from "@/lib/supabase/supabaseClient";
import { useAuthContext } from "@/Providers/AuthProvider";
import { Tables, TablesInsert } from "@/types/database.types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const WorkspaceSidebar = () => {
  const { userProfile } = useAuthContext();
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Tables<"workspace">[]>([]);
  const [newWorkspaceTitle, setNewWorkspaceTitle] = useState("");
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [loadingCreateWorkspace, setLoadingCreateWorkspace] = useState(false);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      // ensure there is a user
      if (!userProfile) return;

      setLoadingWorkspaces(true);
      toast.info("Fetching workspaces...");

      // Fetch workspaces where the joined workspace_member table
      // has a record matching the userProfile.id
      const { data, error } = await supabase
        .from("workspace")
        .select("*, workspace_member!inner(user_id)")
        .eq("workspace_member.user_id", userProfile.id);

      if (error) {
        toast.error(`Error fetching workspaces: ${error.message}`);
        setWorkspaces([]);
      } else if (data) {
        toast.success(`Fetched ${data.length} workspaces`);
        setWorkspaces(data);
      }
      setLoadingWorkspaces(false);
    };

    fetchWorkspaces();
  }, [userProfile]);

  const handleCreateWorkspace = async () => {
    // ensure there is a user
    // ensure there is a title
    if (!userProfile || !newWorkspaceTitle.trim()) return;

    setLoadingCreateWorkspace(true);

    // create the new workspace
    const newWorkspaceDTO: TablesInsert<"workspace"> = {
      title: newWorkspaceTitle,
      owner_id: userProfile.id,
    };

    // post it on db and query it
    const { data: newWorkspace, error: createError } = await supabase
      .from("workspace")
      .insert(newWorkspaceDTO)
      .select()
      .single();

    if (createError || !newWorkspace) {
      toast.error(`Error creating workspace: ${createError?.message}`);
      return;
    }

    // add the new workspace member
    const newMemberDTO: TablesInsert<"workspace_member"> = {
      workspace_id: newWorkspace.id,
      user_id: userProfile.id,
      role: "owner",
    };

    const { error: memberError } = await supabase
      .from("workspace_member")
      .insert(newMemberDTO);

    if (memberError) {
      toast.error(`Error creating workspace member: ${memberError.message}`);
      // roll back workspace creation
      await supabase.from("workspace").delete().eq("id", newWorkspace.id);

      return;
    }

    setWorkspaces((prevWorkspaces) => [...prevWorkspaces, newWorkspace]);
    setNewWorkspaceTitle("");
    setLoadingCreateWorkspace(false);
    toast.success("Workspace created successfully");
    router.push(`/workspaces/${newWorkspace.id}`);
  };

  return (
    <div className="w-64 bg-gray-800 text-white p-4 flex flex-col">
      <h2 className="text-lg font-bold mb-4">Workspaces</h2>
      {loadingWorkspaces && <p>Loading...</p>}
      <ul>
        {workspaces.map((workspace) => (
          <li key={workspace.id} className="mb-2">
            <Link
              href={`/workspaces/${workspace.id}`}
              className="hover:text-gray-300"
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
