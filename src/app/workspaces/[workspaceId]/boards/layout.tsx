"use client";

import { useBoardContext } from "@/Providers/BoardProvider";
import { useWorkspaceContext } from "@/Providers/WorkspaceProvider";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";

type Props = {
  children: React.ReactNode;
};

export const layout = (props: Props) => {
  const { boardId, workspace } = useParams<{ boardId: string, workspace: string }>();
  const { boards, setActiveBoardId } = useBoardContext();
    const { workspaces, setActiveWorkspaceId } = useWorkspaceContext();


  useEffect(() => {
    setActiveBoardId(boardId);
  }, [setActiveBoardId, boardId ]);

  useEffect(() => {
    setActiveWorkspaceId(workspace);
  }, [setActiveWorkspaceId, workspace ]);

  return <>{props.children}</>;
};

export default layout;
