"use client";

import { useBoardContext } from "@/Providers/BoardProvider";
import { useParams, useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";

const EditBoardPage = () => {
    const { workspaceId, boardId } = useParams<{ workspaceId: string, boardId: string }>();
    const { boards, updateBoard, updateBoardState } = useBoardContext();
    const router = useRouter();
    
    const board = useMemo(() => 
        boards.find(b => b.id === boardId),
        [boards, boardId]
    );

    const [newTitle, setNewTitle] = useState(board?.title || '');
    const [confirmationInput, setConfirmationInput] = useState('');

    useEffect(() => {
        if (board) {
            setNewTitle(board.title);
        }
    }, [board]);

    const handleUpdate = async () => {
        if (board && confirmationInput === board.title && newTitle.trim()) {
            await updateBoard(board.id, newTitle.trim());
            router.push(`/workspaces/${workspaceId}/boards`);
        } else {
            alert('Please check your input.');
        }
    }

    if (!board) {
        return (
            <div className="flex items-center justify-center h-full">
                <p>Board not found.</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-4">Edit Board</h1>
            
            <div className="mb-4">
                <label htmlFor="newTitle" className="block text-sm font-medium text-gray-700 mb-1">New board title</label>
                <input 
                    id="newTitle"
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full p-2 border rounded-md"
                />
            </div>

            <hr className="my-8" />

            <p className="mb-4 text-sm text-gray-600">
                To confirm this action, please type the current name of the board ("<strong>{board.title}</strong>") below.
            </p>
            <div className="mb-4">
                <input 
                    type="text"
                    value={confirmationInput}
                    onChange={(e) => setConfirmationInput(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder={board.title}
                />
            </div>
            <button
                onClick={handleUpdate}
                className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
                disabled={confirmationInput !== board.title || updateBoardState === 'loading'}
            >
                {updateBoardState === 'loading' ? 'Updating...' : 'Update Board'}
            </button>
        </div>
    );
}

export default EditBoardPage;
