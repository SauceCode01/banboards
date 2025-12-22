"use client";
import KanbanBoard from "@/components/kanban/Board";
import BoardCollaborators from "@/components/boards/BoardCollaborators";
import { useParams } from "next/navigation";
import React from "react";

const BoardViewPage = () => {
  const { boardId } = useParams<{ boardId: string }>();

  return (
    <div className="h-full w-full bg-slate-950">
      <KanbanBoard />
      <BoardCollaborators />
    </div>
  );
};

export default BoardViewPage;
