"use client";
import BoardView from '@/components/features/board/BoardView';
import React from 'react'

const BoardPage = ({ params }: { params: { boardId: string } }) => {
  return (
    <BoardView boardId={params.boardId} />
  )
}

export default BoardPage
