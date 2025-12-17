"use client";
import BoardList from "@/components/features/board/BoardList";
import React, { useEffect } from "react";

const WorkspacePage = ({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) => {
  const [workspaceId, setWorkspaceId] = React.useState("");

  useEffect(() => {
    params.then((data) => {
      setWorkspaceId(data.workspaceId);
    });
  }, [params]);

  if (!workspaceId) {
    return <div>Loading...</div>;
  }

  return <BoardList workspaceId={ workspaceId} />;
};

export default WorkspacePage;
