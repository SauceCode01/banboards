"use client";
import WorkspaceSettings from "@/components/features/workspace/WorkspaceSettings";
import React, { useEffect } from "react";

const WorkspaceSettingsPage = ({
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
  return <WorkspaceSettings workspaceId={workspaceId} />;
};

export default WorkspaceSettingsPage;
