"use client";
import React, { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import type { Ticket } from "./kanban.types";

interface EditTicketModalProps {
  ticket: Ticket | null;
  onClose: () => void;
  onSave: (values: { title: string; description: string; deadline: string }) => void;
}

const EditTicketModal: React.FC<EditTicketModalProps> = ({ ticket, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (ticket) {
      setTitle(ticket.title || "");
      setDescription(ticket.description || "");
      // assume ISO or date string compatible with input[type=date]
      const d = ticket.deadline ? ticket.deadline.slice(0, 10) : "";
      setDeadline(d);
      setSaving(false);
    }
  }, [ticket]);

  if (!ticket) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      setSaving(true);
      onSave({ title: title.trim(), description: description.trim(), deadline });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={!!ticket} onClose={onClose} title="Edit Task">
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
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-500"
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
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 p-2 bg-slate-800 text-slate-200 rounded-md hover:bg-slate-700 border border-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400/50 transition-colors"
            disabled={!title.trim() || saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditTicketModal;
