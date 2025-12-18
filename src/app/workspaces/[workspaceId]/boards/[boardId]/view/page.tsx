"use client";
import { KanbanBoard } from '@/components/widgets/Kanban/Board';
import { useParams } from 'next/navigation';
import React from 'react'

const BoardViewPage = () => {
    const { boardId } = useParams<{ boardId: string }>();
    
    return (
        <div className="h-screen w-full bg-slate-950">
            <KanbanBoard />
        </div>
    )
}

export default BoardViewPage;
