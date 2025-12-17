"use client";
import BoardList from '@/components/features/board/BoardList';
import { useParams } from 'next/navigation';
import React from 'react'

const BoardsPage = () => {
    const { workspaceId } = useParams<{ workspaceId: string }>();
    return (
        <BoardList workspaceId={workspaceId} />
    )
}

export default BoardsPage;
