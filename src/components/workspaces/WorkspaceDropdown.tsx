"use client";

import { useWorkspaceContext } from "@/Providers/WorkspaceProvider";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronsUpDown, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const WorkspaceDropdown = () => {
  const { workspaces, activeWorkspace, workspacesState } =
    useWorkspaceContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  const handleWorkspaceSelect = (workspaceId: string) => {
    setIsMenuOpen(false);
    router.push(`/workspaces/${workspaceId}/boards`);
  };

  return (
    <div className="relative" ref={menuRef}>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 mt-2 w-full bg-slate-800 border border-slate-700 rounded-lg p-1 z-10"
          >
            <div className="flex flex-col space-y-1">
              {workspaces.map((workspace) => (
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
                  {activeWorkspace?.id === workspace.id && (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsMenuOpen((prev) => !prev)}
        className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
      >
        {workspacesState === "loading" ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium text-slate-400">
              Loading...
            </span>
          </div>
        ) : activeWorkspace ? (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex-shrink-0"></div>
            <span className="text-sm font-semibold text-white truncate">
              {activeWorkspace.title}
            </span>
          </div>
        ) : (
          <span className="text-sm font-medium text-slate-400">
            No workspace
          </span>
        )}
        <ChevronsUpDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
      </button>
    </div>
  );
};

export default WorkspaceDropdown;
