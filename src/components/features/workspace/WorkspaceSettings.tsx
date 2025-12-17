"use client";

import { supabase } from '@/lib/supabase/supabaseClient';
import { useAuthContext } from '@/Providers/AuthProvider';
import { Tables } from '@/types/database.types';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

type WorkspaceMemberWithProfile = Tables<'workspace_member'> & {
    user_profile: Tables<'user_profile'>;
};

const WorkspaceSettings = ({ workspaceId }: { workspaceId: string }) => {
    const { userProfile, session } = useAuthContext();
    const [isOwner, setIsOwner] = useState(false);
    const [members, setMembers] = useState<WorkspaceMemberWithProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [newMemberRole, setNewMemberRole] = useState<Tables<'workspace_member'>['role']>('viewer');

    useEffect(() => {
        const checkOwnershipAndFetchMembers = async () => {
            if (!userProfile) return;

            const { data: ownerData, error: ownerError } = await supabase
                .from('workspace')
                .select('owner_id')
                .eq('id', workspaceId)
                .single();

            if (ownerData && ownerData.owner_id === userProfile.id) {
                setIsOwner(true);

                const { data: memberData, error: memberError } = await supabase
                    .from('workspace_member')
                    .select('*, user_profile!inner(*)')
                    .eq('workspace_id', workspaceId);
                
                if(memberData){
                    setMembers(memberData as WorkspaceMemberWithProfile[]);
                }

            } else {
                setIsOwner(false);
            }
            setLoading(false);
        };

        checkOwnershipAndFetchMembers();
    }, [workspaceId, userProfile]);

    const handleInviteMember = async () => {
        if (!newMemberEmail.trim()) {
            toast.error('Please enter an email');
            return;
        }

        try {
            const response = await fetch('/api/add-user-to-workspace', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({
                    email: newMemberEmail,
                    workspace_id: workspaceId,
                    role: newMemberRole,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success(result.message);
                // Refresh members list
                const { data: memberData, error: memberError } = await supabase
                    .from('workspace_member')
                    .select('*, user_profile!inner(*)')
                    .eq('workspace_id', workspaceId);
                
                if(memberData){
                    setMembers(memberData as WorkspaceMemberWithProfile[]);
                }
                setNewMemberEmail('');
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        }
    }

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!isOwner) {
        return <p>Access Denied. You are not the owner of this workspace.</p>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Workspace Settings</h2>
            
            <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">Members</h3>
                <ul>
                    {members.map(member => (
                        <li key={member.id} className="flex justify-between items-center mb-2 p-2 border rounded">
                            <span>{member.user_profile.username} ({member.id.substring(0,8)})</span>
                            <span>{member.role}</span>
                        </li>
))}
                </ul>
            </div>

            <div>
                <h3 className="text-xl font-bold mb-2">Invite New Member</h3>
                <div className="flex gap-2">
                    <input 
                        type="email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        placeholder="user@example.com"
                        className="p-2 rounded bg-gray-200 flex-grow"
                    />
                    <select
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value as Tables<'workspace_member'>['role'])}
                        className="p-2 rounded bg-gray-200"
                    >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                    </select>
                    <button
                        onClick={handleInviteMember}
                        className="p-2 bg-blue-600 text-white rounded"
                    >
                        Invite
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WorkspaceSettings;
