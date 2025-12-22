"use client";

import { useWorkspaceContext } from "@/Providers/WorkspaceProvider";
import { Tables } from "@/types/database.types";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import WorkspaceSettings from "./WorkspaceSettings";
import { supabase } from "@/lib/supabase/supabaseClient";

interface WorkspaceCardProps {
  workspace: Tables<"workspace">;
}

const WorkspaceCard = ({ workspace }: WorkspaceCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNavigate = (path: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    router.push(path);
  };

  const openSettingsModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSettingsModalOpen(true);
    setMenuOpen(false);
  };

  const handleWorkspaceClicked = async (id: string) => {
    const { data: firstBoards } = await supabase
                .from("board")
                .select("id")
                .eq("workspace_id", id)
                .order("created_at", { ascending: true })
                .limit(1);
    
            const firstBoardId = firstBoards && firstBoards.length > 0 ? firstBoards[0].id : "null";
            router.push(`/workspaces/${id}/boards/${firstBoardId}/view`);
  }

  return (
    <>
      <div
        className="bg-slate-900/70 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 relative flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-slate-700"
        onClick={() => handleWorkspaceClicked(workspace.id)}
      >
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mr-4">
            <span className="text-xl font-bold text-slate-400">
              {workspace.title.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-white truncate">
              {workspace.title}
            </h3>
            <p className="text-sm text-slate-500">
              {new Date(workspace.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={toggleMenu}
              className="text-slate-500 hover:text-white p-2 rounded-full transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
            {menuOpen && (
              <div
                className="absolute top-full right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-20"
                onClick={(e) => e.stopPropagation()}
              >
                <ul>
                  <li>
                    <button
                      onClick={(e) =>
                        handleNavigate(
                          `/workspaces/${workspace.id}/boards`,
                          e
                        )
                      }
                      className="w-full text-left block px-4 py-2 text-slate-300 hover:bg-slate-700/50"
                    >
                      Open
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={openSettingsModal}
                      className="w-full text-left block px-4 py-2 text-slate-300 hover:bg-slate-700/50"
                    >
                      Settings
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
        <div>
          <p className="text-sm text-slate-400">
            {workspace.description || "No description provided."}
          </p>
        </div>
      </div>
      <Modal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        title="Workspace Settings"
      >
        <WorkspaceSettings
          workspace={workspace}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      </Modal>
    </>
  );
};

export default WorkspaceCard;
