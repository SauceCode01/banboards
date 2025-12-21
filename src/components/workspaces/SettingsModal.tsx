"use client";

import { useWorkspaceContext } from "@/Providers/WorkspaceProvider";
import { useState, useMemo, useEffect } from "react";
import { toast } from "react-toastify";

type SettingsModalProps = {
    workspaceId: string;
    onClose?: () => void;
};

const SettingsModal = ({ workspaceId, onClose }: SettingsModalProps) => {
    const { workspaces, updateWorkspace, updateWorkspaceState } = useWorkspaceContext();
    
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
            toast.success('Workspace updated successfully');
            setNewTitle('');
            setConfirmationInput('');
            if (onClose) {
                onClose();
            }
        } else {
            toast.error('Please check your input.');
        }
    }

    if (!workspace) {
        return (
            <div className="flex items-center justify-center">
                <p className="text-slate-400">Workspace not found.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <label htmlFor="newTitle" className="block text-sm font-medium text-slate-300 mb-2">Workspace Title</label>
                <input 
                    id="newTitle"
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-white placeholder-slate-400"
                />
            </div>

            <hr className="my-6 border-slate-700" />

            <p className="mb-4 text-sm text-slate-400">
                To confirm this action, please type the current name of the workspace ("<strong className="text-slate-200">{workspace.title}</strong>") below.
            </p>
            <div className="mb-6">
                <input 
                    type="text"
                    value={confirmationInput}
                    onChange={(e) => setConfirmationInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-white placeholder-slate-400"
                    placeholder={workspace.title}
                />
            </div>
            <button
                onClick={handleUpdate}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                disabled={confirmationInput !== workspace.title || updateWorkspaceState === 'loading'}
            >
                {updateWorkspaceState === 'loading' ? 'Updating...' : 'Update Workspace'}
            </button>
        </div>
    );
}

export default SettingsModal;
