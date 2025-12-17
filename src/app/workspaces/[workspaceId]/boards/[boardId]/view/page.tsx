"use client";
import BoardView from '@/components/features/board/BoardView';
import Kanban from '@/components/widgets/Kanban/Kanban';
import { useParams } from 'next/navigation';
import React from 'react'

const BoardViewPage = () => {
    const { boardId } = useParams<{ boardId: string }>();
    return (
        // <BoardView boardId={boardId} />
        // <Kanban/>
        <div>board view</div>
    )
}

export default BoardViewPage;
