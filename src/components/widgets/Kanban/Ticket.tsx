"use client";
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Ticket } from "./types";

export const TicketContent: React.FC<{ ticket: Ticket; onDelete?: (id: string) => void }> = ({ ticket, onDelete }) => {
  return (
    <div className="bg-slate-800 rounded-md p-3 shadow-sm border border-slate-700 hover:border-slate-500 select-none">
      <div className="flex items-start gap-2">
        <div
          aria-label="Drag ticket"
          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
            <path fillRule="evenodd" d="M8.25 3.75A.75.75 0 0 1 9 3h.75a.75.75 0 0 1 .75.75V6a.75.75 0 0 1-.75.75H9A.75.75 0 0 1 8.25 6V3.75Zm0 7.5A.75.75 0 0 1 9 10.5h.75a.75.75 0 0 1 .75.75V15a.75.75 0 0 1-.75.75H9A.75.75 0 0 1 8.25 15v-3.75Zm0 7.5a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-.75.75H9A.75.75 0 0 1 8.25 21v-2.25Zm5.25-15a.75.75 0 0 1 .75-.75H15a.75.75 0 0 1 .75.75V6a.75.75 0 0 1-.75.75h-.75A.75.75 0 0 1 13.5 6V3.75Zm0 7.5a.75.75 0 0 1 .75-.75H15a.75.75 0 0 1 .75.75V15a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-3.75Zm0 7.5a.75.75 0 0 1 .75-.75H15a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75V18.75Z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-slate-100 text-sm font-medium">{ticket.title}</p>
          {ticket.description ? (
            <p className="text-slate-400 text-xs mt-1 line-clamp-2">{ticket.description}</p>
          ) : null}
          {ticket.deadline ? (
            <p className="text-slate-500 text-[10px] mt-2">Due: {new Date(ticket.deadline).toLocaleDateString()}</p>
          ) : null}
        </div>
        {onDelete ? (
          <button
            onClick={() => onDelete(ticket.id)}
            className="text-slate-400 hover:text-red-400 text-xs"
            title="Delete ticket"
          >
            ✕
          </button>
        ) : null}
      </div>
    </div>
  );
};

interface TicketCardProps {
  ticket: Ticket;
  onDelete?: (id: string) => void;
  dim?: boolean;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onDelete, dim }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ticket.id, data: { type: "Ticket", ticket } });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: dim || isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TicketContent ticket={ticket} onDelete={onDelete} />
    </div>
  );
};

export default TicketCard;
