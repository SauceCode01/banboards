"use client";
import WorkspaceSettings from '@/components/features/workspace/WorkspaceSettings';
import React from 'react'

const WorkspaceSettingsPage = ({ params }: { params: { workspaceId: string } }) => {
  return (
    <WorkspaceSettings workspaceId={params.workspaceId} />
  )
}

export default WorkspaceSettingsPage
