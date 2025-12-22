"use client";
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Tables } from "@/types/database.types";
import { RxDragHandleDots2 } from "react-icons/rx";
import Modal from "@/components/ui/Modal";

export const TicketContent: React.FC<{
  ticket: Tables<"ticket">;
  onDelete?: (id: string) => void;
  dragHandleProps?: { attributes?: any; listeners?: any };
  onEdit?: (ticket: Tables<"ticket">) => void;
  isDragging?: boolean;
}> = ({ ticket, onDelete, dragHandleProps, onEdit, isDragging }) => {
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  return (
    <>
      <div
        className="bg-slate-800 rounded-md p-3 shadow-sm border border-slate-700 hover:border-slate-500 select-none"
        onClick={() => {
          console.log("Ticket clicked:", ticket);
          !isDragging && onEdit?.(ticket);
        }}
      >
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
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmOpen(true);
                }}
                className="text-slate-400 hover:text-red-400 text-xs"
                title="Delete ticket"
              >
                ✕
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {onDelete ? (
        <Modal
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title="Delete Task"
        >
          <div className="space-y-4">
            <p className="text-slate-300 text-sm">
              Are you sure you want to delete
              <span className="text-slate-100 font-medium">
                {" "}
                {ticket.title}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="flex-1 p-2 bg-slate-800 text-slate-200 rounded-md hover:bg-slate-700 border border-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(ticket.id);
                  setConfirmOpen(false);
                }}
                className="flex-1 p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </>
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
    <div ref={setNodeRef} style={style}>
      <TicketContent
        ticket={ticket}
        onDelete={onDelete}
        dragHandleProps={{ attributes, listeners }}
        onEdit={onOpen}
        isDragging={isDragging}
      />
    </div>
  );
};

export default TicketCard;
