"use client";

import { useWorkspaceContext } from "@/Providers/WorkspaceProvider";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";

type Props = {
  children: React.ReactNode;
};

export const layout = (props: Props) => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { workspaces, setActiveWorkspaceId } = useWorkspaceContext();

  useEffect(() => {
    setActiveWorkspaceId(workspaceId);
  }, [setActiveWorkspaceId]);

  return <>{props.children}</>;
};

export default layout;
