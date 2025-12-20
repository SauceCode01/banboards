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
import { dtoast } from "@/lib/utils";
import { QueryState } from "@/types/query.types";
import { useWorkspaceContext } from "./WorkspaceProvider";
import { RealtimeChannel } from "@supabase/supabase-js";

type CreateBoardType = (
  title: string,
  description?: string
) => Promise<Tables<"board"> | undefined>;

export type BoardContextType = {
  activeBoardId?: string;
  setActiveBoardId: Dispatch<SetStateAction<string | undefined>>;
  activeBoard?: Tables<"board">;

  boards: Tables<"board">[];
  setBoards: Dispatch<SetStateAction<Tables<"board">[]>>;
  boardsState: QueryState;

  createBoard: CreateBoardType;
  createBoardState: QueryState;

  deleteBoard: (boardId: string) => Promise<void>;
  deleteBoardState: QueryState;

  updateBoard: (
    boardId: string,
    newTitle: string,
    newDescription?: string
  ) => Promise<void>;
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

export const BoardProvider = ({ children }: { children: React.ReactNode }) => {
  const { activeWorkspaceId, activeWorkspace } = useWorkspaceContext();

  const [activeBoardId, setActiveBoardId] = useState<string | undefined>(
    undefined
  );
  const [boards, setBoards] = useState<Tables<"board">[]>([]);
  const [boardsState, setBoardsState] = useState<QueryState>("idle");

  const [createBoardState, setCreateBoardState] = useState<QueryState>("idle");
  const [deleteBoardState, setDeleteBoardState] = useState<QueryState>("idle");
  const [updateBoardState, setUpdateBoardState] = useState<QueryState>("idle");

  useEffect(() => {
    let channel: RealtimeChannel;

    const setupChannel = async () => {
      channel = supabase.channel("schema-db-changes-board");

      // handle insert
      channel.on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "board" },
        (payload) => {
          console.log("board inserted", payload);
          setBoards((prev) => [...prev, payload.new as Tables<"board">]);
        }
      );

      // handle update
      channel.on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "board" },
        (payload) => {
          console.log("board updated", payload);
          setBoards((prev) =>
            prev.map((w) =>
              w.id === payload.new.id ? (payload.new as Tables<"board">) : w
            )
          );
        }
      );

      // handle deleete
      channel.on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "board" },
        (payload) => {
          console.log("board deleted", payload);
          setBoards((prev) => prev.filter((w) => w.id !== payload.old.id));
        }
      );

      channel.subscribe();
    };
    setupChannel();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  // console.log(
  //   "boards",
  //   activeWorkspace,
  //   boards.find((b) => b.id === activeBoardId)
  // );

  useEffect(() => {
    if (!activeWorkspaceId) {
      setBoards([]);
      setActiveBoardId(undefined); // Clear active board if no workspace is active
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
        // Automatically select the first board of the workspace
      }
      setBoardsState("idle");
    };

    fetchBoards();
  }, [activeWorkspaceId]);

  const createBoard = async (title: string, description?: string) => {
    if (!activeWorkspaceId || !title.trim()) return;
    setCreateBoardState("loading");

    const newBoardDTO: TablesInsert<"board"> = {
      title,
      description,
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

    // Step B: Create default lists for the new board
    const defaultLists: TablesInsert<"list">[] = [
      { board_id: newBoard.id, title: "Backlog", position: 0 },
      { board_id: newBoard.id, title: "Todo", position: 1 },
      { board_id: newBoard.id, title: "In Progress", position: 2 },
      { board_id: newBoard.id, title: "Done", position: 3 },
    ];

    const { error: listError } = await supabase
      .from("list")
      .insert(defaultLists);

    if (listError) {
      dtoast(
        `Board created, but failed to create default lists: ${listError.message}`,
        "error"
      );
    } else {
      dtoast("Board and default lists created successfully");
    }

    // Step C: Update application state: add the new board; lists are fetched per-board elsewhere
    setBoards((prevBoards) => [...prevBoards, newBoard]);
    setActiveBoardId(newBoard.id); // Switch to the new board
    setCreateBoardState("idle");
    return newBoard;
  };

  const deleteBoard = async (boardId: string) => {
    setDeleteBoardState("loading");
    dtoast("Deleting board...");
    const { error } = await supabase.from("board").delete().eq("id", boardId);

    if (error) {
      dtoast(`Error deleting board: ${error.message}`, "error");
    } else {
      const remainingBoards = boards.filter((b) => b.id !== boardId);
      setBoards(remainingBoards);
      // If the deleted board was the active one, switch to the first available one
      if (activeBoardId === boardId) {
        setActiveBoardId(remainingBoards[0]?.id);
      }
      dtoast("Board deleted successfully");
    }
    setDeleteBoardState("idle");
  };

  const updateBoard = async (
    boardId: string,
    newTitle: string,
    newDescription?: string
  ) => {
    setUpdateBoardState("loading");
    dtoast("Updating board...");
    const { data, error } = await supabase
      .from("board")
      .update({ title: newTitle, description: newDescription })
      .eq("id", boardId)
      .select()
      .single();

    if (error || !data) {
      dtoast(`Error updating board: ${error?.message}`, "error");
    } else {
      setBoards((prev) => prev.map((b) => (b.id === boardId ? data : b)));
      dtoast("Board updated successfully");
    }
    setUpdateBoardState("idle");
  };

  const activeBoard = useMemo(
    () => boards.find((b) => b.id === activeBoardId),
    [boards, activeBoardId]
  );

  const value = {
    activeBoardId,
    setActiveBoardId,
    activeBoard,
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
    <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
  );
};
