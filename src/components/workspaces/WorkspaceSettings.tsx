"use client";

import { useWorkspaceContext } from "@/Providers/WorkspaceProvider";
import { Tables } from "@/types/database.types";
import { useState } from "react";

interface WorkspaceSettingsProps {
  workspace: Tables<"workspace">;
  onClose: () => void;
}

const WorkspaceSettings = ({ workspace, onClose }: WorkspaceSettingsProps) => {
  const { updateWorkspace, deleteWorkspace, createWorkspaceState } =
    useWorkspaceContext();
  const [newTitle, setNewTitle] = useState(workspace.title);
  const [newDescription, setNewDescription] = useState(
    workspace.description || ""
  );

  const handleUpdate = async () => {
    if (
      newTitle.trim() &&
      (newTitle.trim() !== workspace.title ||
        newDescription.trim() !== (workspace.description || ""))
    ) {
      await updateWorkspace(
        workspace.id,
        newTitle.trim(),
        newDescription.trim()
      );
      onClose();
    }
  };

  const handleDelete = async () => {
    await deleteWorkspace(workspace.id);
    onClose();
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
        onClick={handleUpdate}
        className="w-full p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400/50 transition-colors"
        disabled={
          !newTitle.trim() ||
          (newTitle.trim() === workspace.title &&
            newDescription.trim() === (workspace.description || "")) ||
          createWorkspaceState === "loading"
        }
      >
        {createWorkspaceState === "loading" ? "Saving..." : "Save changes"}
      </button>

      <div className="my-6 border-t border-slate-800"></div>

      <h3 className="text-lg font-semibold text-red-500 mb-2">Danger Zone</h3>
      <p className="text-sm text-slate-400 mb-4">
        Deleting a workspace is permanent and cannot be undone.
      </p>
      <button
        onClick={handleDelete}
        className="w-full p-2 bg-red-600/20 text-red-500 border border-red-500/50 rounded-md hover:bg-red-600/30 disabled:opacity-50 transition-colors"
        disabled={createWorkspaceState === "loading"}
      >
        {createWorkspaceState === "loading"
          ? "Deleting..."
          : "Delete Workspace"}
      </button>
    </div>
  );
};

export default WorkspaceSettings;
