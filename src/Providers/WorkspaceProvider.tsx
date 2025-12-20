"use client";

import { supabase } from "@/lib/supabase/supabaseClient";
import { Tables, TablesInsert } from "@/types/database.types";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { useAuthContext } from "./AuthProvider";
import { QueryState } from "@/types/query.types";
import { dtoast } from "@/lib/utils";
import { desc, sup } from "framer-motion/client";
import { RealtimeChannel } from "@supabase/supabase-js";

type CreateWorkspaceType = (
  title: string,
  description?: string
) => Promise<Tables<"workspace"> | undefined>;

export type WorkspaceContextType = {
  activeWorkspaceId?: string;
  setActiveWorkspaceId: Dispatch<SetStateAction<string | undefined>>;
  activeWorkspace?: Tables<"workspace">;

  workspaces: Tables<"workspace">[];
  setWorkspaces: Dispatch<SetStateAction<Tables<"workspace">[]>>;
  workspacesState: QueryState;

  createWorkspace: CreateWorkspaceType;
  createWorkspaceState: QueryState;

  deleteWorkspace: (workspaceId: string) => Promise<void>;
  deleteWorkspaceState: QueryState;

  updateWorkspace: (
    workspaceId: string,
    newTitle: string,
    newDescription?: string
  ) => Promise<void>;
  updateWorkspaceState: QueryState;
};

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export const useWorkspaceContext = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error(
      "useWorkspaceContext must be used within a WorkspaceProvider"
    );
  }
  return context;
};

export const WorkspaceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { userProfile } = useAuthContext();

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<
    string | undefined
  >(undefined);
  const [workspaces, setWorkspaces] = useState<Tables<"workspace">[]>([]);
  const [workspacesState, setWorkspacesState] = useState<QueryState>("idle");

  const [createWorkspaceState, setCreateWorkspaceState] =
    useState<QueryState>("idle");
  const [deleteWorkspaceState, setDeleteWorkspaceState] =
    useState<QueryState>("idle");
  const [updateWorkspaceState, setUpdateWorkspaceState] =
    useState<QueryState>("idle");

  useEffect(() => {
    if (!userProfile) return;


    const handleFetchWorkspaces = async () => {
      if (!userProfile) return;

      if (workspaces.length > 0) setWorkspacesState("refetch");
      else setWorkspacesState("loading");

      const { data, error } = await supabase.from("workspace").select("*");

      if (error) {
        dtoast(`Error fetching workspaces: ${error.message}`, "error");
        setWorkspaces([]);
        setWorkspacesState("idle");
      } else if (data) {
        dtoast(`Fetched ${data.length} workspaces`);
        setWorkspaces(data);
        // If there's no active workspace and we have data, set the first one as active.
        if (data.length > 0 && !activeWorkspaceId) {
          setActiveWorkspaceId(data[0].id);
        }
        setWorkspacesState("idle");
      }
    };

    handleFetchWorkspaces();
  }, [userProfile, activeWorkspaceId]); // Depend on activeWorkspaceId to refetch if needed, though not strictly necessary here.

  const createWorkspace = async (title: string, description?: string) => {
    if (!userProfile || !title.trim()) return;
    setCreateWorkspaceState("loading");

    const newWorkspaceDTO: TablesInsert<"workspace"> = {
      title,
      description,
      owner_id: userProfile.id,
    };
    const { data: newWorkspace, error: createError } = await supabase
      .from("workspace")
      .insert(newWorkspaceDTO)
      .select()
      .single();

    if (createError || !newWorkspace) {
      dtoast(`Error creating workspace: ${createError?.message}`, "error");
      setCreateWorkspaceState("idle");
      return;
    }

    const newMemberDTO: TablesInsert<"workspace_member"> = {
      workspace_id: newWorkspace.id,
      user_id: userProfile.id,
      role: "owner",
    };
    const { error: memberError } = await supabase
      .from("workspace_member")
      .insert(newMemberDTO);

    if (memberError) {
      dtoast(
        `Error creating workspace member: ${memberError.message}`,
        "error"
      );
      await supabase.from("workspace").delete().eq("id", newWorkspace.id);
      setCreateWorkspaceState("idle");
      return;
    }

    setWorkspaces((prev) => [...prev, newWorkspace]);
    setActiveWorkspaceId(newWorkspace.id); // Switch to the new workspace
    setCreateWorkspaceState("idle");
    dtoast("Workspace created successfully");
    return newWorkspace;
  };

  const deleteWorkspace = async (workspaceId: string) => {
    if (!workspaceId) return;
    if (!userProfile) return;
    setDeleteWorkspaceState("loading");
    dtoast("Deleting workspace...");
    const { error } = await supabase
      .from("workspace")
      .delete()
      .eq("id", workspaceId);

    if (error) {
      dtoast(`Error deleting workspace: ${error.message}`, "error");
    } else {
      setWorkspaces((prev) => prev.filter((w) => w.id !== workspaceId));
      // If the deleted workspace was the active one, switch to the first available one
      if (activeWorkspaceId === workspaceId) {
        const firstWorkspace = workspaces.find((w) => w.id !== workspaceId);
        setActiveWorkspaceId(firstWorkspace?.id);
      }
      dtoast("Workspace deleted successfully");
    }
    setDeleteWorkspaceState("idle");
  };

  const updateWorkspace = async (
    workspaceId: string,
    newTitle: string,
    newDescription?: string
  ) => {
    setUpdateWorkspaceState("loading");
    dtoast("Updating workspace...");
    const { data, error } = await supabase
      .from("workspace")
      .update({ title: newTitle, description: newDescription })
      .eq("id", workspaceId)
      .select()
      .single();

    if (error || !data) {
      dtoast(`Error updating workspace: ${error?.message}`, "error");
    } else {
      setWorkspaces((prev) =>
        prev.map((w) => (w.id === workspaceId ? data : w))
      );
      dtoast("Workspace updated successfully");
    }
    setUpdateWorkspaceState("idle");
  };

  /**
   * REALTIME LISTENERS FOR WORKSPACE
   */
  useEffect(() => {
    let channel: RealtimeChannel;

    const setupChannel = async () => {
      await supabase.realtime.setAuth();

      channel = supabase.channel("schema-db-changes");

      // handle insert
      channel.on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "workspace" },
        (payload) => {
          console.log("workspace inserted", payload);
          setWorkspaces((prev) => [
            ...prev,
            payload.new as Tables<"workspace">,
          ]);
        }
      );

      // handle update
      channel.on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "workspace" },
        (payload) => {
          console.log("workspace updated", payload);
          setWorkspaces((prev) =>
            prev.map((w) =>
              w.id === payload.new.id ? (payload.new as Tables<"workspace">) : w
            )
          );
        }
      );

      // handle deleete
      channel.on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "workspace" },
        (payload) => {
          console.log("workspace deleted", payload);
          setWorkspaces((prev) => prev.filter((w) => w.id !== payload.old.id));
        }
      );

      channel.subscribe();
    };

    setupChannel();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  });

  const activeWorkspace = useMemo(
    () => workspaces.find((w) => w.id === activeWorkspaceId),
    [workspaces, activeWorkspaceId]
  );

  const value = {
    activeWorkspaceId,
    setActiveWorkspaceId,
    activeWorkspace,
    workspaces,
    setWorkspaces,
    workspacesState,
    createWorkspace,
    createWorkspaceState,
    deleteWorkspace,
    deleteWorkspaceState,
    updateWorkspace,
    updateWorkspaceState,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};
