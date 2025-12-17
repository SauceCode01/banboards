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

export type WorkspaceContextType = {
  workspaceId?: string;
  boardId?: string;
  setWorkspaceId: Dispatch<SetStateAction<string | undefined>>;
  setBoardId: Dispatch<SetStateAction<string | undefined>>;

  workspaces: Tables<"workspace">[];
  setWorkspaces: Dispatch<SetStateAction<Tables<"workspace">[]>>;
  loadingWorkspaces: boolean;

  createNewWorkspace: (
    title: string
  ) => Promise<Tables<"workspace"> | undefined>;
  loadingCreateWorkspace: boolean;
};

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export const useWorkspaceContext = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

export const WorkspaceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [workspaceId, setWorkspaceId] = useState<string | undefined>(undefined);
  const [boardId, setBoardId] = useState<string | undefined>(undefined);

  const { userProfile } = useAuthContext();
  const [workspaces, setWorkspaces] = useState<Tables<"workspace">[]>([]);

  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);

  const [loadingCreateWorkspace, setLoadingCreateWorkspace] = useState(false);

  const handleFetchWorkspaces = async () => {
    // ensure there is a user
    if (!userProfile) return;

    setLoadingWorkspaces(true);
    toast.info("Fetching workspaces...");

    // Fetch workspaces where the joined workspace_member table
    // has a record matching the userProfile.id
    const { data, error } = await supabase.from("workspace").select("* ");

    if (error) {
      toast.error(`Error fetching workspaces: ${error.message}`);
      setWorkspaces([]);
    } else if (data) {
      toast.success(`Fetched ${data.length} workspaces`);
      setWorkspaces(data);
    }
    setLoadingWorkspaces(false);
  };

  useEffect(() => {
    handleFetchWorkspaces();
  }, [userProfile]);

  const createNewWorkspace = async (title: string) => {
    // ensure there is a user
    // ensure there is a title
    if (!userProfile || !title.trim()) return;

    setLoadingCreateWorkspace(true);

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
    setLoadingCreateWorkspace(false);
    toast.success("Workspace created successfully");

    return newWorkspace;
  };

  const value = {
    workspaceId,
    boardId,
    setWorkspaceId,
    setBoardId,

    workspaces,
    setWorkspaces,
    loadingWorkspaces,

    createNewWorkspace,
    loadingCreateWorkspace,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};
