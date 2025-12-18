"use client";
import { useState } from "react";
import Modal from "@/components/ui/Modal";

interface AddTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTicket: (title: string) => void;
}

const AddTicketModal = ({
  isOpen,
  onClose,
  onAddTicket,
}: AddTicketModalProps) => {
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTicket(title.trim());
      setTitle("");
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Ticket">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Ticket Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
              placeholder="Enter ticket title"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
            >
              Add Ticket
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddTicketModal;
