"use client";

import { supabase } from "@/lib/supabase/supabaseClient";
import { useAuthContext } from "@/Providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const WorkspacesPage = () => {
    const { userProfile } = useAuthContext();
    const router = useRouter();

    useEffect(() => {
        if (!userProfile) return;

        const fetchWorkspacesAndRedirect = async () => {
            const { data: memberData, error: memberError } = await supabase
                .from('workspace_member')
                .select('workspace_id')
                .eq('user_id', userProfile.id);

            if (memberData && memberData.length > 0) {
                // Redirect to the first workspace
                router.push(`/workspaces/${memberData[0].workspace_id}`);
            }
        };

        fetchWorkspacesAndRedirect();
    }, [userProfile, router]);

    return (
        <div className="flex items-center justify-center h-full">
            <p>You are not a member of any workspace. Create one from the sidebar.</p>
        </div>
    );
};

export default WorkspacesPage;
