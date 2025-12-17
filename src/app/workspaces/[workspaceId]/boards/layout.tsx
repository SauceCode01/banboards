"use client";

import { useBoardContext } from "@/Providers/BoardProvider";
import { useWorkspaceContext } from "@/Providers/WorkspaceProvider";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";

type Props = {
  children: React.ReactNode;
};

export const layout = (props: Props) => {
  const { boardId } = useParams<{ boardId: string }>();
  const { boards, setActiveBoardId } = useBoardContext();

  useEffect(() => {
    setActiveBoardId(boardId);
  }, [setActiveBoardId]);

  return <>{props.children}</>;
};

export default layout;
