"use client";
import BoardView from "@/components/features/board/BoardView";
import React, { useEffect } from "react";

const BoardPage = ({ params }: { params: Promise<{ boardId: string }> }) => {
  const [boardId, setBoardId] = React.useState("");

  useEffect(() => {
    params.then((data) => {
      setBoardId(data.boardId);
    });
  }, [params]);

  if (!boardId) {
    return <div>Loading...</div>;
  }

  return <BoardView boardId={boardId} />;
};

export default BoardPage;
