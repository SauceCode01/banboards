"use client";
import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";

interface AddTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  listName?: string;
  onSubmit: (values: { title: string; description: string; deadline: string }) => void;
}

export const AddTicketModal: React.FC<AddTicketModalProps> = ({ isOpen, onClose, listName, onSubmit }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setDeadline("");
      setSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      setSubmitting(true);
      onSubmit({ title: title.trim(), description: description.trim(), deadline });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add Task${listName ? ` · ${listName}` : ""}`}> 
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-500"
            placeholder="e.g. Design login screen"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-500"
            placeholder="Optional details for this task"
          />
        </div>
        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-slate-300 mb-2">Deadline</label>
          <input
            id="deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-500"
          />
        </div>
        <button
          type="submit"
          className="w-full p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400/50 transition-colors"
          disabled={!title.trim() || submitting}
        >
          {submitting ? "Adding..." : "Add Task"}
        </button>
      </form>
    </Modal>
  );
};

export default AddTicketModal;
