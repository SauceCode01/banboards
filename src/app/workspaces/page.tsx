"use client";

import NewWorkspaceForm from "@/components/widgets/WorkspaceForm";
import { supabase } from "@/lib/supabase/supabaseClient";
import { Tables } from "@/types/database.types";
import React, { useEffect, useState } from "react";

const WorkSpacesPage = () => {
  const [workspaces, setWorkspaces] = useState<Tables<"workspace">[]>([]);

  const handleGetAllWorkspaces = async () => {
    const { data, error } = await supabase.from("workspace").select("*, user_profile!inner(*)");
    if (error) {
      console.error("Error fetching workspaces:", error.message);
    } else {
      console.log("Workspaces:", data);
      setWorkspaces(data);
    }
  };

  useEffect(() => {
    handleGetAllWorkspaces();
  }, []);

  return (
    <>
      <div>WorkSpacesPage</div>

      <NewWorkspaceForm/>

      <h1/>

      {workspaces.map((workspace) => (
        <div key={workspace.id} className="border-2 p-2">{workspace.title}</div>
      ))}
    </>
  );
};

export default WorkSpacesPage;
