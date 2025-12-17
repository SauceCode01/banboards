"use client";

import { useWorkspaceContext } from "@/Providers/WorkspaceProvider";
import WorkspaceCard from "@/components/widgets/workspaces/WorkspaceCard";

const WorkspacesPage = () => {
  const { workspaces, workspacesState } = useWorkspaceContext();

  if (workspacesState === "loading" || workspacesState==="initial") {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading workspaces...</p>
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="mb-4">You are not a member of any workspace.</p>
        <a
          href="/workspaces/new"
          className="p-2 bg-blue-600 text-white rounded"
        >
          Create One
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Your Workspaces</h2>
        <a
          href="/workspaces/new"
          className="p-2 bg-blue-600 text-white rounded"
        >
          Create New Workspace
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {workspaces.map((workspace) => (
          <WorkspaceCard workspace={workspace} key={workspace.id} />
        ))}
      </div>
    </div>
  );
};

export default WorkspacesPage;
