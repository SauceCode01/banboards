"use client";

import { supabase } from "@/lib/supabase/supabaseClient";
import { Tables, TablesInsert } from "@/types/database.types";
import { Session } from "@supabase/supabase-js";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { useAuthContext } from "./AuthProvider";
import { QueryState } from "@/types/query.types";
import { dtoast } from "@/lib/utils";

type CreateWorkspaceType = (
  title: string
) => Promise<Tables<"workspace"> | undefined>;

/**
 * defining the type of the context
 */
export type WorkspaceContextType = {
  activeWorkspaceId?: string;
  setAcctiveWorkspaceId: Dispatch<SetStateAction<string | undefined>>;

  workspaces: Tables<"workspace">[];
  setWorkspaces: Dispatch<SetStateAction<Tables<"workspace">[]>>;
  workspacesState: QueryState;

  createWorkspace: CreateWorkspaceType;
  createWorkspaceState: QueryState;
};

/**
 * creating the context
 */
const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

/**
 * creating a hook to use the context
 */
export const useWorkspaceContext = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

/**
 * creating the context provider to wrap the app
 */
export const WorkspaceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // using the auth context to detect the current user
  const { userProfile } = useAuthContext();

  // defining workspaces states
  const [activeWorkspaceId, setAcctiveWorkspaceId] = useState<
    string | undefined
  >(undefined);
  const [workspaces, setWorkspaces] = useState<Tables<"workspace">[]>([]);
  const [workspacesState, setWorkspacesState] = useState<QueryState>("idle");

  // defining states for mutations
  const [createWorkspaceState, setCreateWorkspaceState] =
    useState<QueryState>("idle");

  const handleFetchWorkspaces = async () => {
    // ensure there is a user
    if (!userProfile) return;

    setWorkspacesState("loading");

    dtoast("Fetching workspaces...");

    // Fetch workspaces of the user. 
    // no need to filter due to RLS
    const { data, error } = await supabase.from("workspace").select("* ");

    if (error) {
      dtoast(`Error fetching workspaces: ${error.message}`, "error");
      setWorkspaces([]);
    } else if (data) {
      dtoast(`Fetched ${data.length} workspaces`);
      setWorkspaces(data);
    }
    setWorkspacesState("idle");
  };

  useEffect(() => { 
    handleFetchWorkspaces();
  }, [userProfile]);

  const createWorkspace = async (title: string) => {
    // ensure there is a user
    // ensure there is a title
    if (!userProfile || !title.trim()) return;

    setCreateWorkspaceState("loading");

    // create the new workspace
    const newWorkspaceDTO: TablesInsert<"workspace"> = {
      title: title,
      owner_id: userProfile.id,
    };

    // post it on db and query it
    const { data: newWorkspace, error: createError } = await supabase
      .from("workspace")
      .insert(newWorkspaceDTO)
      .select()
      .single();

    if (createError || !newWorkspace) {
      dtoast(`Error creating workspace: ${createError?.message}`, "error");
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
      dtoast(`Error creating workspace member: ${memberError.message}`, "error");
      // roll back workspace creation
      await supabase.from("workspace").delete().eq("id", newWorkspace.id);

      return;
    }

    setWorkspaces((prevWorkspaces) => [...prevWorkspaces, newWorkspace]);
    setCreateWorkspaceState("idle");
    dtoast("Workspace created successfully");

    return newWorkspace;
  };

  const value = {
    activeWorkspaceId,  
    setAcctiveWorkspaceId, 

    workspaces,
    setWorkspaces,
    workspacesState,

    createWorkspace,
    createWorkspaceState,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};
