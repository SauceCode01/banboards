"use client";
import BoardView from "@/components/features/board/BoardView";
import { useBoardContext } from "@/Providers/BoardProvider";
import React, { useEffect } from "react";

const BoardPage = ({ params }: { params: Promise<{ boardId: string }> }) => {
  const [boardId, setBoardId] = React.useState("");
  const { setActiveBoardId } = useBoardContext();

  useEffect(() => {
    params.then((data) => {
      setBoardId(data.boardId);
      setActiveBoardId(data.boardId);
    });
  }, [params, setActiveBoardId]);

  if (!boardId) {
    return <div>Loading...</div>;
  }

  return <BoardView boardId={boardId} />;
};

export default BoardPage;
