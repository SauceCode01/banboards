"use client";
import React from "react";
import Modal from "@/components/ui/Modal";
import { Tables } from "@/types/database.types";
import { useKanban } from "@/Providers/KanbanProvider";

interface ViewTicketModalProps {
  ticket: Tables<"ticket"> | null;
  onClose: () => void;
  onEdit: (ticket: Tables<"ticket">) => void;
}

const ViewTicketModal: React.FC<ViewTicketModalProps> = ({ ticket, onClose, onEdit }) => {
  const { lists } = useKanban();
  if (!ticket) return null;

  const list = lists.find((l) => l.id === ticket.list_id);
  const deadlineLabel = ticket.deadline
    ? new Date(ticket.deadline).toLocaleDateString()
    : "None";
  const createdLabel = ticket.created_at
    ? new Date(ticket.created_at).toLocaleString()
    : "";

  return (
    <Modal isOpen={!!ticket} onClose={onClose} title="Task Details">
      <div className="space-y-6">
        {/* Header with title and actions */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white wrap-break-word">{ticket.title}</h3>
            <p className="mt-1 text-xs text-slate-400">Created: {createdLabel}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => onEdit(ticket)}
              className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Meta info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">List</div>
            <div className="text-sm text-slate-100">{list?.title || "Unknown"}</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">Deadline</div>
            <div className="text-sm text-slate-100">{deadlineLabel}</div>
          </div>
        </div>

        {/* Description */}
        <div>
          <div className="text-xs text-slate-400 mb-2">Description</div>
          <div className="bg-slate-800 border border-slate-700 rounded-md p-3 max-h-100 overflow-y-auto">
            <p className="text-sm text-slate-200 whitespace-pre-wrap ">
              {ticket.description?.trim() ? ticket.description : "No description"}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewTicketModal;
