"use client";

import { useBoardContext } from "@/Providers/BoardProvider";
import { Tables } from "@/types/database.types";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface BoardCardProps {
    board: Tables<'board'>;
}

const BoardCard = ({ board }: BoardCardProps) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const router = useRouter();
    const { deleteBoard } = useBoardContext();

    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setMenuOpen(!menuOpen);
    }

    const handleNavigate = (path: string) => {
        router.push(path);
    }

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this board?")) {
            await deleteBoard(board.id);
        }
        setMenuOpen(false);
    }

    return (
        <div 
            className="bg-white rounded-lg shadow-md p-4 relative h-32 flex flex-col justify-between cursor-pointer"
            onClick={() => handleNavigate(`/workspaces/${board.workspace_id}/boards/${board.id}/view`)}
        >
            <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-gray-800">{board.title}</h3>
                <button onClick={toggleMenu} className="text-gray-500 hover:text-gray-700 p-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                </button>
            </div>
            
            {menuOpen && (
                <div 
                    className="absolute top-10 right-4 bg-white border rounded-md shadow-lg z-10"
                    onClick={(e) => e.stopPropagation()}
                >
                    <ul>
                        <li 
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleNavigate(`/workspaces/${board.workspace_id}/boards/${board.id}/view`)}
                        >
                            Open
                        </li>
                        <li 
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleNavigate(`/workspaces/${board.workspace_id}/boards/${board.id}/edit`)}
                        >
                            Edit
                        </li>
                        <li 
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600"
                            onClick={handleDelete}
                        >
                            Delete
                        </li>
                    </ul>
                </div>
            )}
             <div className="text-sm text-gray-500">
                {new Date(board.created_at).toLocaleDateString()}
            </div>
        </div>
    );
};

export default BoardCard;
