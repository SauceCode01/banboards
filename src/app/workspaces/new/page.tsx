"use client";

import { useWorkspaceContext } from "@/Providers/WorkspaceProvider";
import { useRouter } from "next/navigation";
import { useState } from "react";

const NewWorkspacePage = () => {
    const { createWorkspace, createWorkspaceState } = useWorkspaceContext();
    const router = useRouter();
    const [newTitle, setNewTitle] = useState('');

    const handleCreate = async () => {
        if (newTitle.trim()) {
            const newWorkspace = await createWorkspace(newTitle.trim());
            if (newWorkspace) {
                router.push(`/workspaces/${newWorkspace.id}/boards`);
            }
        }
    }

    return (
        <div className="p-4 md:p-8 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-4">Create New Workspace</h1>
            
            <div className="mb-4">
                <label htmlFor="newTitle" className="block text-sm font-medium text-gray-700 mb-1">Workspace title</label>
                <input 
                    id="newTitle"
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="My new workspace"
                />
            </div>

            <button
                onClick={handleCreate}
                className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
                disabled={!newTitle.trim() || createWorkspaceState === 'loading'}
            >
                {createWorkspaceState === 'loading' ? 'Creating...' : 'Create Workspace'}
            </button>
        </div>
    );
}

export default NewWorkspacePage;
