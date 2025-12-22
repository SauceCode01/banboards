"use client";

import { useBoardContext } from "@/Providers/BoardProvider";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";

type Props = {
  children: React.ReactNode;
};

const BoardsLayout = (props: Props) => {
  const { boardId } = useParams<{ boardId: string }>();
  const { setActiveBoardId } = useBoardContext();

  useEffect(() => {
    setActiveBoardId(boardId && boardId !== "null" ? boardId : undefined);
  }, [setActiveBoardId, boardId]);

  return <>{props.children}</>;
};

export default BoardsLayout;