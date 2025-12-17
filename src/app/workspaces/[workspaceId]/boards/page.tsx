"use client";

import { useBoardContext } from "@/Providers/BoardProvider";
import BoardCard from "@/components/widgets/boards/BoardCard";
import { useState } from "react";

const BoardsPage = () => {
    const { boards, boardsState, createBoard, createBoardState } = useBoardContext();
    const [newBoardTitle, setNewBoardTitle] = useState('');

    const handleCreateBoard = async () => {
        if(newBoardTitle.trim()){
            console.log("calling create board")
            await createBoard(newBoardTitle.trim());
            setNewBoardTitle('');
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Boards</h2>
                <div className="flex gap-2">
                    <input 
                        type="text"
                        value={newBoardTitle}
                        onChange={(e) => setNewBoardTitle(e.target.value)}
                        placeholder="New board title"
                        className="p-2 rounded bg-gray-200"
                        disabled={createBoardState === 'loading'}
                    />
                    <button
                        onClick={handleCreateBoard}
                        className="p-2 bg-blue-600 text-white rounded disabled:bg-blue-400"
                        disabled={createBoardState === 'loading'}
                    >
                        {createBoardState === 'loading' ? 'Creating...' : 'Create Board'}
                    </button>
                </div>
            </div>

            {boardsState === 'loading' ? (
                <p>Loading boards...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {boards.map(board => (
                        <BoardCard key={board.id} board={board} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default BoardsPage;
