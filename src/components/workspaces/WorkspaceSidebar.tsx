"use client";

import { useWorkspaceContext } from "@/Providers/WorkspaceProvider";
import { useBoardContext } from "@/Providers/BoardProvider";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronsUpDown, Check, LayoutGrid, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/supabaseClient";
import Modal from "@/components/ui/Modal";
import NewBoard from "@/components/boards/NewBoard";

// Skeleton component for loading states
const SkeletonItem = () => (
    <div className="h-8 bg-slate-700/50 rounded-md animate-pulse" />
);

export default function WorkspaceSidebar() {
    const { workspaces, activeWorkspace, workspacesState } = useWorkspaceContext();
    const { boards, activeBoardId, boardsState } = useBoardContext();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNewBoardModalOpen, setIsNewBoardModalOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleWorkspaceSelect = async (workspaceId: string) => { 
        setIsMenuOpen(false);
        // Fetch first board in the selected workspace; if none, use 'null'
        const { data: firstBoards } = await supabase
            .from("board")
            .select("id")
            .eq("workspace_id", workspaceId)
            .order("created_at", { ascending: true })
            .limit(1);

        const firstBoardId = firstBoards && firstBoards.length > 0 ? firstBoards[0].id : "null";
        router.push(`/workspaces/${workspaceId}/boards/${firstBoardId}/view`);
    };

    const handleBoardSelect = (boardId: string) => {
        router.push(`/workspaces/${activeWorkspace?.id}/boards/${boardId}/view`);
    };
    
    return (
        <aside className="w-64 min-w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-3">
            {/* Boards List */}
            <div className="flex-grow">
                <h2 className="text-xs font-semibold text-slate-400 px-2 mb-2">BOARDS</h2>
                <div className="space-y-1">
                    {boardsState === 'loading' ? (
                        <div className="space-y-2 px-2">
                            <SkeletonItem />
                            <SkeletonItem />
                            <SkeletonItem />
                        </div>
                    ) : boards.length > 0 ? (
                        boards.map((board) => (
                            <button
                                key={board.id}
                                onClick={() => handleBoardSelect(board.id)}
                                className={cn(
                                    "w-full flex items-center gap-2 p-2 rounded-md text-sm font-medium transition-colors text-left",
                                    activeBoardId === board.id
                                        ? "bg-indigo-600/20 text-indigo-300"
                                        : "text-slate-300 hover:bg-slate-800/50"
                                )}
                            >
                                <LayoutGrid className="w-4 h-4" />
                                <span>{board.title}</span>
                            </button>
                        ))
                    ) : (
                        <p className="text-sm text-slate-500 px-2">No boards yet.</p>
                    )}
                </div>
                 <button
                    onClick={() => setIsNewBoardModalOpen(true)}
                    className="flex items-center gap-2 p-2 mt-2 rounded-md text-sm font-medium text-slate-400 hover:bg-slate-800/50 w-full"
                 >
                    <Plus className="w-4 h-4" />
                    <span>New Board</span>
                 </button>
            </div>

            {/* Workspace Selector */}
            <div className="relative" ref={menuRef}>
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 border border-slate-700 rounded-lg p-1 z-10"
                        >
                            <div className="flex flex-col space-y-1">
                                {workspaces.map(workspace => (
                                    <button
                                        key={workspace.id}
                                        onClick={() => handleWorkspaceSelect(workspace.id)}
                                        className={cn(
                                            "w-full text-left flex items-center justify-between p-2 rounded-md text-sm font-medium",
                                            activeWorkspace?.id === workspace.id
                                                ? "bg-slate-700/80 text-white"
                                                : "text-slate-300 hover:bg-slate-700/50"
                                        )}
                                    >
                                        <span>{workspace.title}</span>
                                        {activeWorkspace?.id === workspace.id && <Check className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={() => setIsMenuOpen(prev => !prev)}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                >
                    {workspacesState === 'loading' ? (
                        <div className="flex items-center gap-2">
                             <Loader2 className="w-4 h-4 animate-spin"/>
                             <span className="text-sm font-medium text-slate-400">Loading...</span>
                        </div>
                    ) : activeWorkspace ? (
                        <div className="flex items-center gap-2 overflow-hidden">
                            <div className="w-6 h-6 rounded-md bg-indigo-600 shrink-0"></div>
                            <span className="text-sm font-semibold text-white truncate">{activeWorkspace.title}</span>
                        </div>
                    ) : (
                         <span className="text-sm font-medium text-slate-400">No workspace</span>
                    )}
                    <ChevronsUpDown className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
            </div>

            <Modal
                isOpen={isNewBoardModalOpen}
                onClose={() => setIsNewBoardModalOpen(false)}
                title="Create New Board"
            >
                <NewBoard onClose={() => setIsNewBoardModalOpen(false)} />
            </Modal>
        </aside>
    );
}
