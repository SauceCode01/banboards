"use client";

import { useWorkspaceContext } from "@/Providers/WorkspaceProvider";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";

type Props = {
  children: React.ReactNode;
};

export const layout = (props: Props) => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { workspaces, setAcctiveWorkspaceId } = useWorkspaceContext();

  useEffect(() => {
    setAcctiveWorkspaceId(workspaceId);
  }, [setAcctiveWorkspaceId]);

  return <>{props.children}</>;
};

export default layout;
