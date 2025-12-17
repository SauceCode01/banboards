"use client";

import { useWorkspaceContext } from "@/Providers/WorkspaceProvider";
import { useParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";

const DeleteWorkspacePage = () => {
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const { workspaces, deleteWorkspace } = useWorkspaceContext();
    const router = useRouter();
    const [confirmationInput, setConfirmationInput] = useState('');

    const workspace = useMemo(() => 
        workspaces.find(ws => ws.id === workspaceId),
        [workspaces, workspaceId]
    );

    const handleDelete = async () => {
        if (workspace && confirmationInput === workspace.title) {
            await deleteWorkspace(workspace.id);
            router.push('/workspaces');
        } else {
            alert('The workspace name you entered is incorrect.');
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
            <h1 className="text-2xl font-bold mb-4">Delete Workspace</h1>
            <p className="mb-4">
                Are you sure you want to delete the workspace "<strong>{workspace.title}</strong>"?
            </p>
            <p className="mb-4 text-sm text-gray-600">
                This action is irreversible. To confirm, please type the name of the workspace below.
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
                onClick={handleDelete}
                className="w-full p-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-400"
                disabled={confirmationInput !== workspace.title}
            >
                Delete Workspace
            </button>
        </div>
    );
}

export default DeleteWorkspacePage;
