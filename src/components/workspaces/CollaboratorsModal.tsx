"use client";

import { supabase } from '@/lib/supabase/supabaseClient';
import { useAuthContext } from '@/Providers/AuthProvider';
import { Tables } from '@/types/database.types';
import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';

type WorkspaceMemberWithProfile = Tables<'workspace_member'> & {
    user_profile: Tables<'user_profile'>;
};

type CollaboratorsModalProps = {
    workspaceId: string;
};

const CollaboratorsModal = ({ workspaceId }: CollaboratorsModalProps) => {
    const { userProfile, session } = useAuthContext();
    const [isOwner, setIsOwner] = useState(false);
    const [members, setMembers] = useState<WorkspaceMemberWithProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [newMemberRole, setNewMemberRole] = useState<Tables<'workspace_member'>['role']>('viewer');

    const fetchMembers = useCallback(async () => {
        if (!workspaceId) return;
        const { data: memberData, error: memberError } = await supabase
            .from('workspace_member')
            .select('*, user_profile!inner(*)')
            .eq('workspace_id', workspaceId);
        
        if(memberData){
            const userIds = memberData.map(m => m.user_id);
            const { data: profilesData, error: profilesError } = await supabase
                .from('user_profile')
                .select('*')
                .in('id', userIds);

            if (profilesData) {
                const membersWithProfiles = memberData.map(member => {
                    const profile = profilesData.find(p => p.id === member.user_id);
                    return { ...member, user_profile: profile! };
                });
                setMembers(membersWithProfiles as WorkspaceMemberWithProfile[]);
            }
        }
    }, [workspaceId]);

    useEffect(() => {
        const checkOwnershipAndFetchMembers = async () => {
            if (!userProfile || !workspaceId) return;
            setLoading(true);
            const { data: ownerData, error: ownerError } = await supabase
                .from('workspace')
                .select('owner_id')
                .eq('id', workspaceId)
                .single();

            if (ownerData && ownerData.owner_id === userProfile.id) {
                setIsOwner(true);
                await fetchMembers();
            } else {
                setIsOwner(false);
            }
            setLoading(false);
        };

        checkOwnershipAndFetchMembers();
    }, [workspaceId, userProfile, fetchMembers]);

    const handleInviteMember = async () => {
        if (!newMemberEmail.trim()) {
            toast.error('Please enter an email');
            return;
        }
        if(!workspaceId) return;

        const { data: profile, error: profileError } = await supabase
            .from('user_profile')
            .select('id')
            .eq('email', newMemberEmail)
            .single();
        
        if (profileError || !profile) {
            toast.error('User not found.');
            return;
        }

        const { error: insertError } = await supabase
            .from('workspace_member')
            .insert({
                workspace_id: workspaceId,
                user_id: profile.id,
                role: newMemberRole,
            });
        
        if (insertError) {
            if (insertError.code === '23505') { // unique constraint violation
                toast.error('User is already a member of this workspace');
            } else {
                toast.error(insertError.message);
            }
            return;
        }

        toast.success('Member added successfully');
        await fetchMembers();
        setNewMemberEmail('');
    }

    const handleRemoveMember = async (memberId: string) => {
        if (!window.confirm("Are you sure you want to remove this member?")) return;

        const { error } = await supabase
            .from('workspace_member')
            .delete()
            .eq('id', memberId);
        
        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Member removed');
            await fetchMembers();
        }
    }

    const handleUpdateRole = async (memberId: string, newRole: Tables<'workspace_member'>['role']) => {
        const { error } = await supabase
            .from('workspace_member')
            .update({ role: newRole })
            .eq('id', memberId);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Role updated');
            await fetchMembers();
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
            <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Add Member</h3>
                <div className="flex gap-2 mb-4">
                    <input
                        type="email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="flex-1 px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-white placeholder-slate-400"
                    />
                    <select
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value as Tables<'workspace_member'>['role'])}
                        className="px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-white"
                    >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                    </select>
                </div>
                <button
                    onClick={handleInviteMember}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Add Member
                </button>
            </div>

            <div>
                <h3 className="text-xl font-bold mb-4">Members</h3>
                <ul className="space-y-2">
                    {members.map(member => (
                        <li key={member.id} className="flex justify-between items-center p-3 border border-slate-700 rounded-lg bg-slate-800/50">
                            <span className="text-white">{member.user_profile.username}</span>
                            <div className="flex items-center gap-2">
                                {userProfile?.id === member.user_id ? (
                                    <span className="text-slate-400 text-sm">{member.role} (You)</span>
                                ) : (
                                    <>
                                        <select
                                            value={member.role}
                                            onChange={(e) => handleUpdateRole(member.id, e.target.value as Tables<'workspace_member'>['role'])}
                                            className="px-2 py-1 rounded bg-slate-700 text-white text-sm"
                                        >
                                            <option value="viewer">Viewer</option>
                                            <option value="editor">Editor</option>
                                        </select>
                                        <button
                                            onClick={() => handleRemoveMember(member.id)}
                                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default CollaboratorsModal;
