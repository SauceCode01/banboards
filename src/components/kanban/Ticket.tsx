"use client";
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Tables } from "@/types/database.types";
import { RxDragHandleDots2 } from "react-icons/rx";

export const TicketContent: React.FC<{
  ticket: Tables<"ticket">;
  onDelete?: (id: string) => void;
  dragHandleProps?: { attributes?: any; listeners?: any };
}> = ({ ticket, onDelete, dragHandleProps }) => {
  return (
    <div className="bg-slate-800 rounded-md p-3 shadow-sm border border-slate-700 hover:border-slate-500 select-none">
      <div className="flex items-stretch flex-row gap-2 ">
        <div
          aria-label="Drag ticket"
          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-200 flex justify-center items-center "
          {...(dragHandleProps?.attributes || {})}
          {...(dragHandleProps?.listeners || {})}
          onClick={(e) => e.stopPropagation()}
        >
          <RxDragHandleDots2 />
        </div>
        <div className="flex-1">
          <p className="text-slate-100 text-sm font-medium">{ticket.title}</p>
          {ticket.description ? (
            <p className="text-slate-400 text-xs mt-1 line-clamp-2">
              {ticket.description}
            </p>
          ) : null}
          {ticket.deadline ? (
            <p className="text-slate-500 text-[10px] mt-2">
              Due: {new Date(ticket.deadline).toLocaleDateString()}
            </p>
          ) : null}
        </div>
        {onDelete ? (
          <div className="h-full flex flex-col">
            <button
              onClick={() => onDelete(ticket.id)}
              className="text-slate-400 hover:text-red-400 text-xs"
              title="Delete ticket"
            >
              ✕
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

interface TicketCardProps {
  ticket: Tables<"ticket">;
  onDelete?: (id: string) => void;
  dim?: boolean;
  onOpen?: (ticket: Tables<"ticket">) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  onDelete,
  dim,
  onOpen,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id, data: { type: "Ticket", ticket } });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: dim || isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => !isDragging && onOpen?.(ticket)}
    >
      <TicketContent
        ticket={ticket}
        onDelete={onDelete}
        dragHandleProps={{ attributes, listeners }}
      />
    </div>
  );
};

export default TicketCard;
