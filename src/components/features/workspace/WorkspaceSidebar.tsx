"use client";
import { supabase } from '@/lib/supabase/supabaseClient';
import { useAuthContext } from '@/Providers/AuthProvider';
import { Tables } from '@/types/database.types';
import React, { useEffect, useState } from 'react'

const WorkspaceSidebar = () => {
    const { userProfile } = useAuthContext();
    const [workspaces, setWorkspaces] = useState<Tables<'workspace'>[]>([]);
    const [newWorkspaceTitle, setNewWorkspaceTitle] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorkspaces = async () => {
            if (!userProfile) return;
            const { data, error } = await supabase
                .from('workspace_member')
                .select('*, workspace(*)')
                .eq('user_id', userProfile.id);

            if (data) {
                const workspaces = data.map(member => member.workspace).filter((ws): ws is Tables<'workspace'> => ws !== null);
                setWorkspaces(workspaces);
            }
            setLoading(false);
        };
        fetchWorkspaces();
    }, [userProfile]);

    const handleCreateWorkspace = async () => {
        if (!userProfile || !newWorkspaceTitle.trim()) return;

        const { data: newWorkspace, error: createError } = await supabase
            .from('workspace')
            .insert({
                title: newWorkspaceTitle,
                owner_id: userProfile.id,
            })
            .select()
            .single();

        if (createError || !newWorkspace) {
            console.error("Error creating workspace", createError);
            return;
        }

        const { error: memberError } = await supabase
            .from('workspace_member')
            .insert({
                workspace_id: newWorkspace.id,
                user_id: userProfile.id,
                role: 'owner'
            });

        if (memberError) {
            console.error("Error adding workspace member", memberError);
             // roll back workspace creation?
            return;
        }

        setWorkspaces([...workspaces, newWorkspace]);
        setNewWorkspaceTitle('');
    }

    return (
        <div className="w-64 bg-gray-800 text-white p-4 flex flex-col">
            <h2 className="text-lg font-bold mb-4">Workspaces</h2>
            {loading && <p>Loading...</p>}
            <ul>
                {workspaces.map((workspace) => (
                    <li key={workspace.id} className="mb-2">
                        <a href={`/workspaces/${workspace.id}`} className="hover:text-gray-300">{workspace.title}</a>
                    </li>
                ))}
            </ul>
            <div className="mt-auto">
                <input
                    type="text"
                    value={newWorkspaceTitle}
                    onChange={(e) => setNewWorkspaceTitle(e.target.value)}
                    placeholder="New workspace title"
                    className="w-full p-2 rounded bg-gray-700 text-white"
                />
                <button
                    onClick={handleCreateWorkspace}
                    className="w-full mt-2 p-2 bg-blue-600 hover:bg-blue-700 rounded"
                >
                    Create Workspace
                </button>
            </div>
        </div>
    )
}

export default WorkspaceSidebar
