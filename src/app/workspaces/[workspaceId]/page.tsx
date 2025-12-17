"use client";

import { useWorkspaceContext } from "@/Providers/WorkspaceProvider";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import Link from "next/link";

const WorkspacePage = () => {
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const { workspaces } = useWorkspaceContext();

    const workspace = useMemo(() =>
        workspaces.find(ws => ws.id === workspaceId),
        [workspaces, workspaceId]
    );

    const actions = [
        { name: 'Boards', href: `/workspaces/${workspaceId}/boards`, description: 'View and manage your boards' },
        { name: 'Collaborators', href: `/workspaces/${workspaceId}/collaborators`, description: 'Manage who has access to this workspace' },
        { name: 'Edit Workspace', href: `/workspaces/${workspaceId}/edit`, description: 'Change the name of your workspace' },
        { name: 'Delete Workspace', href: `/workspaces/${workspaceId}/delete`, description: 'Permanently delete this workspace' },
    ];

    if (!workspace) {
        return <div>Loading workspace...</div>;
    }

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-8">
                Welcome to <span className="text-blue-600">{workspace.title}</span>
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {actions.map((action) => (
                    <Link href={action.href} key={action.name}>
                        <div className="block p-6 bg-white border rounded-lg shadow-md hover:shadow-lg transition-shadow h-full">
                            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">{action.name}</h5>
                            <p className="font-normal text-gray-700">{action.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default WorkspacePage;

