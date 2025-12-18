"use client";

import { useBoardContext } from "@/Providers/BoardProvider";
import BoardCard from "@/components/widgets/boards/BoardCard";
import { useState } from "react";
import Link from "next/link";
import WorkspaceDropdown from "@/components/features/workspace/WorkspaceDropdown";
import Modal from "@/components/ui/Modal";
import NewBoard from "@/components/features/board/NewBoard";
import CollaboratorsModal from "@/components/features/workspace/CollaboratorsModal";
import { useParams } from "next/navigation";

const BoardsPage = () => {
  const { boards, boardsState } = useBoardContext();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [isNewBoardModalOpen, setIsNewBoardModalOpen] = useState(false);
  const [isCollaboratorsModalOpen, setIsCollaboratorsModalOpen] = useState(false);

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
            <div className="flex gap-3">
              <button
                onClick={() => setIsCollaboratorsModalOpen(true)}
                className="px-4 py-3 bg-slate-700 text-white rounded-lg shadow-md hover:bg-slate-600 transition-colors"
              >
                Collaborators
              </button>
              <button
                onClick={() => setIsNewBoardModalOpen(true)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
              >
                Create New Board
              </button>
            </div>
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
        <Modal
          isOpen={isCollaboratorsModalOpen}
          onClose={() => setIsCollaboratorsModalOpen(false)}
          title="Collaborators"
        >
          <CollaboratorsModal workspaceId={workspaceId as string} />
        </Modal>
      </>
    );
  }

  return (
    <>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <WorkspaceDropdown />
          <div className="flex gap-3">
            <button
              onClick={() => setIsCollaboratorsModalOpen(true)}
              className="px-4 py-3 bg-slate-700 text-white rounded-lg shadow-md hover:bg-slate-600 transition-colors"
            >
              Collaborators
            </button>
            <button
              onClick={() => setIsNewBoardModalOpen(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
            >
              Create New Board
            </button>
          </div>
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
      <Modal
        isOpen={isCollaboratorsModalOpen}
        onClose={() => setIsCollaboratorsModalOpen(false)}
        title="Collaborators"
      >
        <CollaboratorsModal workspaceId={workspaceId as string} />
      </Modal>
    </>
  );
};

export default BoardsPage;
