"use client";
import BoardList from '@/components/features/board/BoardList';
import React from 'react'

const WorkspacePage = ({ params }: { params: { workspaceId: string } }) => {
  return (
    <BoardList workspaceId={params.workspaceId} />
  )
}

export default WorkspacePage
