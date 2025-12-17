import WorkspaceSidebar from '@/components/features/workspace/WorkspaceSidebar'
import React from 'react'

const WorkspacesLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <main className="flex h-screen">
            <WorkspaceSidebar />
            <div className="flex-1 p-4">
                {children}
            </div>
        </main>
    )
}

export default WorkspacesLayout
