"use client";

import { useWorkspaceContext } from "@/Providers/WorkspaceProvider";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface NewWorkspaceProps {
  onClose: () => void;
}

const NewWorkspace = ({ onClose }: NewWorkspaceProps) => {
  const { createWorkspace, createWorkspaceState } = useWorkspaceContext();
  const router = useRouter();
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const handleCreate = async () => {
    if (newTitle.trim()) {
      const newWorkspace = await createWorkspace(
        newTitle.trim(),
        newDescription.trim()
      );
      if (newWorkspace) {
        onClose();
        // router.push(`/workspaces/${newWorkspace.id}/boards`);
      }
    }
  };

  return (
    <div>
      <div className="mb-6">
        <label
          htmlFor="newTitle"
          className="block text-sm font-medium text-slate-300 mb-2"
        >
          Workspace title
        </label>
        <input
          id="newTitle"
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-500"
          placeholder="My new workspace"
        />
      </div>
      <div className="mb-6">
        <label
          htmlFor="newDescription"
          className="block text-sm font-medium text-slate-300 mb-2"
        >
          Workspace description (optional)
        </label>
        <textarea
          id="newDescription"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-500"
          placeholder="A brief description of your workspace"
          rows={3}
        />
      </div>

      <button
        onClick={handleCreate}
        className="w-full p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400/50 transition-colors"
        disabled={!newTitle.trim() || createWorkspaceState === "loading"}
      >
        {createWorkspaceState === "loading"
          ? "Creating..."
          : "Create Workspace"}
      </button>
    </div>
  );
};

export default NewWorkspace;
