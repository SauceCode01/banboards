"use client";

import { useWorkspaceContext } from "@/Providers/WorkspaceProvider";
import { useParams, useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";

const EditWorkspacePage = () => {
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const { workspaces, updateWorkspace, updateWorkspaceState } = useWorkspaceContext();
    const router = useRouter();
    
    const workspace = useMemo(() => 
        workspaces.find(ws => ws.id === workspaceId),
        [workspaces, workspaceId]
    );

    const [newTitle, setNewTitle] = useState(workspace?.title || '');
    const [confirmationInput, setConfirmationInput] = useState('');

    useEffect(() => {
        if (workspace) {
            setNewTitle(workspace.title);
        }
    }, [workspace]);

    const handleUpdate = async () => {
        if (workspace && confirmationInput === workspace.title && newTitle.trim()) {
            await updateWorkspace(workspace.id, newTitle.trim());
            router.push('/workspaces');
        } else {
            alert('Please check your input.');
        }
    }

    if (!workspace) {
        return (
            <div className="flex items-center justify-center h-full">
                <p>Workspace not found.</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-4">Edit Workspace</h1>
            
            <div className="mb-4">
                <label htmlFor="newTitle" className="block text-sm font-medium text-gray-700 mb-1">New workspace title</label>
                <input 
                    id="newTitle"
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full p-2 border rounded-md"
                />
            </div>

            <hr className="my-8" />

            <p className="mb-4 text-sm text-gray-600">
                To confirm this action, please type the current name of the workspace ("<strong>{workspace.title}</strong>") below.
            </p>
            <div className="mb-4">
                <input 
                    type="text"
                    value={confirmationInput}
                    onChange={(e) => setConfirmationInput(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder={workspace.title}
                />
            </div>
            <button
                onClick={handleUpdate}
                className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
                disabled={confirmationInput !== workspace.title || updateWorkspaceState === 'loading'}
            >
                {updateWorkspaceState === 'loading' ? 'Updating...' : 'Update Workspace'}
            </button>
        </div>
    );
}

export default EditWorkspacePage;
