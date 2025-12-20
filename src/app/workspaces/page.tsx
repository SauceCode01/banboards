"use client";

import { useWorkspaceContext } from "@/Providers/WorkspaceProvider"; 
import Link from "next/link";
import { useState } from "react";
import Modal from "@/components/ui/Modal"; 
import NewWorkspace from "@/components/workspaces/NewWorkspace";
import WorkspaceCard from "@/components/workspaces/WorkspaceCard";

const WorkspacesPage = () => {
  const { workspaces, workspacesState } = useWorkspaceContext();
  const [isNewWorkspaceModalOpen, setIsNewWorkspaceModalOpen] = useState(false);

  if (workspacesState === "loading" || workspacesState === "initial") {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading workspaces...</p>
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <>
        <div className="text-center h-full flex flex-col items-center justify-center">
          <div className="max-w-md mx-auto bg-slate-900/70 backdrop-blur-sm p-8 rounded-2xl border border-slate-800 text-center">
            <h2 className="text-2xl font-bold mb-4 text-white">
              No Workspaces Found
            </h2>
            <p className="text-slate-400 mb-6">
              It looks like you are not part of any workspace yet. Get started
              by creating a new one.
            </p>
            <button
              onClick={() => setIsNewWorkspaceModalOpen(true)}
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
            >
              Create Your First Workspace
            </button>
          </div>
        </div>
        <Modal
          isOpen={isNewWorkspaceModalOpen}
          onClose={() => setIsNewWorkspaceModalOpen(false)}
          title="Create New Workspace"
        >
          <NewWorkspace onClose={() => setIsNewWorkspaceModalOpen(false)} />
        </Modal>
      </>
    );
  }

  return (
    <>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Your Workspaces</h1>
            <p className="text-slate-400 mt-2">
              Access your boards, collaborators, and settings.
            </p>
          </div>
          <button
            onClick={() => setIsNewWorkspaceModalOpen(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
          >
            Create New Workspace
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {workspaces.map((workspace) => (
            <WorkspaceCard workspace={workspace} key={workspace.id} />
          ))}
        </div>
      </div>
      <Modal
        isOpen={isNewWorkspaceModalOpen}
        onClose={() => setIsNewWorkspaceModalOpen(false)}
        title="Create New Workspace"
      >
        <NewWorkspace onClose={() => setIsNewWorkspaceModalOpen(false)} />
      </Modal>
    </>
  );
};

export default WorkspacesPage;
