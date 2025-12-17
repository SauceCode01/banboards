"use client";

import { supabase } from "@/lib/supabase/supabaseClient";
import { useAuthContext } from "@/Providers/AuthProvider";
import { useWorkspaceContext } from "@/Providers/WorkspaceProvider";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";

/**
 * fetches all workspaces of the user
 * if there is a workspace,
 */
const WorkspacesPage = () => {
  const router = useRouter();

  const { workspaces } = useWorkspaceContext();

  useEffect(() => {
    if (!workspaces) return;

    if (workspaces && workspaces.length > 0) {
      // Redirect to the first workspace
      router.push(`/workspaces/${workspaces[0].id}`);
    }
  }, [workspaces]);

  return (
    <div className="flex items-center justify-center h-full">
      <p>You are not a member of any workspace. Create one from the sidebar.</p>
    </div>
  );
};

export default WorkspacesPage;
