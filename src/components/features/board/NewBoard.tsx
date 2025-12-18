"use client";

import { useBoardContext } from "@/Providers/BoardProvider";
import { useState } from "react";

interface NewBoardProps {
  onClose: () => void;
}

const NewBoard = ({ onClose }: NewBoardProps) => {
  const { createBoard, createBoardState } = useBoardContext();
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const handleCreate = async () => {
    if (newTitle.trim()) {
      await createBoard(newTitle.trim(), newDescription.trim());
      onClose();
    }
  };

  return (
    <div>
      <div className="mb-6">
        <label
          htmlFor="newTitle"
          className="block text-sm font-medium text-slate-300 mb-2"
        >
          Board title
        </label>
        <input
          id="newTitle"
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-500"
          placeholder="My new board"
        />
      </div>
      <div className="mb-6">
        <label
          htmlFor="newDescription"
          className="block text-sm font-medium text-slate-300 mb-2"
        >
          Board description (optional)
        </label>
        <textarea
          id="newDescription"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-500"
          placeholder="A brief description of your board"
          rows={3}
        />
      </div>

      <button
        onClick={handleCreate}
        className="w-full p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400/50 transition-colors"
        disabled={!newTitle.trim() || createBoardState === "loading"}
      >
        {createBoardState === "loading" ? "Creating..." : "Create Board"}
      </button>
    </div>
  );
};

export default NewBoard;
