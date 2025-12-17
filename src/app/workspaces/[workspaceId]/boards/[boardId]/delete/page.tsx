"use client";

import { useBoardContext } from "@/Providers/BoardProvider";
import { useParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";

const DeleteBoardPage = () => {
    const { workspaceId, boardId } = useParams<{ workspaceId: string, boardId: string }>();
    const { boards, deleteBoard } = useBoardContext();
    const router = useRouter();
    const [confirmationInput, setConfirmationInput] = useState('');

    const board = useMemo(() => 
        boards.find(b => b.id === boardId),
        [boards, boardId]
    );

    const handleDelete = async () => {
        if (board && confirmationInput === board.title) {
            await deleteBoard(board.id);
            router.push(`/workspaces/${workspaceId}/boards`);
        } else {
            alert('The board name you entered is incorrect.');
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
            <h1 className="text-2xl font-bold mb-4">Delete Board</h1>
            <p className="mb-4">
                Are you sure you want to delete the board "<strong>{board.title}</strong>"?
            </p>
            <p className="mb-4 text-sm text-gray-600">
                This action is irreversible. To confirm, please type the name of the board below.
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
                onClick={handleDelete}
                className="w-full p-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-400"
                disabled={confirmationInput !== board.title}
            >
                Delete Board
            </button>
        </div>
    );
}

export default DeleteBoardPage;
