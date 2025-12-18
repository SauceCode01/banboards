"use client";

import { useBoardContext } from "@/Providers/BoardProvider";
import BoardCard from "@/components/widgets/boards/BoardCard";
import { useState } from "react";
import Link from "next/link";
import WorkspaceDropdown from "@/components/features/workspace/WorkspaceDropdown";
import Modal from "@/components/ui/Modal";
import NewBoard from "@/components/features/board/NewBoard";

const BoardsPage = () => {
  const { boards, boardsState } = useBoardContext();
  const [isNewBoardModalOpen, setIsNewBoardModalOpen] = useState(false);

  if (boardsState === "loading" || boardsState === "initial") {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading boards...</p>
      </div>
    );
  }

  if (boards.length === 0) {
    return (
      <>
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <WorkspaceDropdown />
            <button
              onClick={() => setIsNewBoardModalOpen(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
            >
              Create New Board
            </button>
          </div>
          <div className="text-center h-full flex flex-col items-center justify-center">
            <div className="max-w-md mx-auto bg-slate-900/70 backdrop-blur-sm p-8 rounded-2xl border border-slate-800 text-center">
              <h2 className="text-2xl font-bold mb-4 text-white">
                No Boards Found
              </h2>
              <p className="text-slate-400 mb-6">
                It looks like there are no boards in this workspace yet. Get
                started by creating a new one.
              </p>
              <button
                onClick={() => setIsNewBoardModalOpen(true)}
                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
              >
                Create Your First Board
              </button>
            </div>
          </div>
        </div>
        <Modal
          isOpen={isNewBoardModalOpen}
          onClose={() => setIsNewBoardModalOpen(false)}
          title="Create New Board"
        >
          <NewBoard onClose={() => setIsNewBoardModalOpen(false)} />
        </Modal>
      </>
    );
  }

  return (
    <>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <WorkspaceDropdown />
          <button
            onClick={() => setIsNewBoardModalOpen(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
          >
            Create New Board
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </div>
      </div>
      <Modal
        isOpen={isNewBoardModalOpen}
        onClose={() => setIsNewBoardModalOpen(false)}
        title="Create New Board"
      >
        <NewBoard onClose={() => setIsNewBoardModalOpen(false)} />
      </Modal>
    </>
  );
};

export default BoardsPage;
