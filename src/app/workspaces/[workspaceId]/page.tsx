"use client";
import BoardList from "@/components/features/board/BoardList";
import { supabase } from "@/lib/supabase/supabaseClient";
import { useAuthContext } from "@/Providers/AuthProvider";
import { useWorkspaceContext } from "@/Providers/WorkspaceProvider";
import { Tables } from "@/types/database.types";
import React, { useEffect, useState } from "react";

const WorkspacePage = ({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) => {
  const { userProfile } = useAuthContext();
  const { workspaceId, setWorkspaceId } = useWorkspaceContext();
  const [boards, setBoards] = useState<Tables<"board">[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [userRole, setUserRole] = useState<
    Tables<"workspace_member">["role"] | null
  >(null);

  useEffect(() => {
    const fetchBoardsAndRole = async () => {
      if (!userProfile) return;

      // Fetch boards
      const { data: boardData, error: boardError } = await supabase
        .from("board")
        .select("*")
        .eq("workspace_id", workspaceId);

      if (boardData) {
        console.log("boards fetched", boardData, workspaceId);
        setBoards(boardData);
      }
      setLoading(false);

      // Fetch user role
      const { data: memberData, error: memberError } = await supabase
        .from("workspace_member")
        .select("role")
        .eq("workspace_id", workspaceId)
        .eq("user_id", userProfile.id)
        .single();

      if (memberData) {
        setUserRole(memberData.role);
      }
    };

    fetchBoardsAndRole();
  }, [workspaceId, userProfile]);

  const handleCreateBoard = async () => {
    if (!newBoardTitle.trim()) return;

    const { data: newBoard, error } = await supabase
      .from("board")
      .insert({
        title: newBoardTitle,
        workspace_id: workspaceId,
      })
      .select()
      .single();

    if (newBoard) {
      setBoards([...boards, newBoard]);
      setNewBoardTitle("");
    }
  };
  useEffect(() => {
    params.then((data) => {
      console.log("params changed", data)
      setWorkspaceId(data.workspaceId);
    });
  }, [params]);

  if (!workspaceId) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Boards</h2>
        {userRole === "owner" && (
          <a
            href={`/workspaces/${workspaceId}/settings`}
            className="p-2 bg-gray-600 text-white rounded"
          >
            Settings
          </a>
        )}
      </div>
      <div className="mb-4">
        <input
          type="text"
          value={newBoardTitle}
          onChange={(e) => setNewBoardTitle(e.target.value)}
          placeholder="New board title"
          className="p-2 rounded bg-gray-200"
        />
        <button
          onClick={handleCreateBoard}
          className="ml-2 p-2 bg-blue-600 text-white rounded"
        >
          Create Board
        </button>
      </div>
      {loading ? (
        <p>Loading boards...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {boards.map((board) => (
            <a href={`/boards/${board.id}`} key={board.id}>
              <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-bold">{board.title}</h3>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkspacePage;
