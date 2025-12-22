"use client";

import BoardCollaborators from "@/components/boards/BoardCollaborators";
import KanbanBoard from "@/components/kanban/Board";
import React from "react";

const BoardViewClient = () => {
  return (
    <div className="h-full w-full bg-slate-950">
      <KanbanBoard />
      <BoardCollaborators />
    </div>
  );
};

export default BoardViewClient;
