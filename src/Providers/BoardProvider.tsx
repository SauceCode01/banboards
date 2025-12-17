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
} from "react";
import { dtoast } from "@/lib/utils";
import { QueryState } from "@/types/query.types";
import { useWorkspaceContext } from "./WorkspaceProvider";

type CreateBoardType = (
  title: string
) => Promise<Tables<"board"> | undefined>;

export type BoardContextType = {
  activeBoardId?: string;
  setActiveBoardId: Dispatch<SetStateAction<string | undefined>>;

  boards: Tables<"board">[];
  setBoards: Dispatch<SetStateAction<Tables<"board">[]>>;
  boardsState: QueryState;

  createBoard: CreateBoardType;
  createBoardState: QueryState;

  deleteBoard: (boardId: string) => Promise<void>;
  deleteBoardState: QueryState;

  updateBoard: (boardId: string, newTitle: string) => Promise<void>;
  updateBoardState: QueryState;
};

const BoardContext = createContext<BoardContextType | null>(null);

export const useBoardContext = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error("useBoardContext must be used within a BoardProvider");
  }
  return context;
};

export const BoardProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { activeWorkspaceId } = useWorkspaceContext();

  const [activeBoardId, setActiveBoardId] = useState<string | undefined>(undefined);
  const [boards, setBoards] = useState<Tables<"board">[]>([]);
  const [boardsState, setBoardsState] = useState<QueryState>("idle");

  const [createBoardState, setCreateBoardState] = useState<QueryState>("idle");
  const [deleteBoardState, setDeleteBoardState] = useState<QueryState>("idle");
  const [updateBoardState, setUpdateBoardState] = useState<QueryState>("idle");

  useEffect(() => {
    if (!activeWorkspaceId) {
      setBoards([]);
      return;
    }

    const fetchBoards = async () => {
      setBoardsState("loading");
      dtoast("Fetching boards...");

      const { data, error } = await supabase
        .from("board")
        .select("*")
        .eq("workspace_id", activeWorkspaceId);

      if (error) {
        dtoast(`Error fetching boards: ${error.message}`, "error");
        setBoards([]);
      } else if (data) {
        dtoast(`Fetched ${data.length} boards`);
        setBoards(data);
      }
      setBoardsState("idle");
    };

    fetchBoards();
  }, [activeWorkspaceId]);

  const createBoard = async (title: string) => {
    console.log("active workspace id", activeWorkspaceId)
    if (!activeWorkspaceId || !title.trim()) return;

    setCreateBoardState("loading");

    console.log("creating board...")

    const newBoardDTO: TablesInsert<"board"> = {
      title: title,
      workspace_id: activeWorkspaceId,
    };

    const { data: newBoard, error } = await supabase
      .from("board")
      .insert(newBoardDTO)
      .select()
      .single();

    if (error || !newBoard) {
      dtoast(`Error creating board: ${error?.message}`, "error");
      setCreateBoardState("idle");
      return;
    }

    setBoards((prevBoards) => [...prevBoards, newBoard]);
    setCreateBoardState("idle");
    dtoast("Board created successfully");

    return newBoard;
  };

  const deleteBoard = async (boardId: string) => {
    setDeleteBoardState("loading");
    dtoast("Deleting board...");

    const { error } = await supabase
      .from("board")
      .delete()
      .eq("id", boardId);

    if (error) {
      dtoast(`Error deleting board: ${error.message}`, "error");
    } else {
      setBoards((prev) => prev.filter((b) => b.id !== boardId));
      dtoast("Board deleted successfully");
    }
    setDeleteBoardState("idle");
  };

  const updateBoard = async (boardId: string, newTitle: string) => {
    setUpdateBoardState("loading");
    dtoast("Updating board...");

    const { data, error } = await supabase
      .from("board")
      .update({ title: newTitle })
      .eq("id", boardId)
      .select()
      .single();

    if (error || !data) {
      dtoast(`Error updating board: ${error?.message}`, "error");
    } else {
      setBoards((prev) =>
        prev.map((b) => (b.id === boardId ? data : b))
      );
      dtoast("Board updated successfully");
    }
    setUpdateBoardState("idle");
  };

  const value = {
    activeBoardId,
    setActiveBoardId,

    boards,
    setBoards,
    boardsState,

    createBoard,
    createBoardState,

    deleteBoard,
    deleteBoardState,

    updateBoard,
    updateBoardState,
  };

  return (
    <BoardContext.Provider value={value}>
      {children}
    </BoardContext.Provider>
  );
};
