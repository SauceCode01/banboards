"use client";
import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { List, Ticket } from "./types";
import { TicketCard } from "./Ticket";

interface BoardListProps {
  list: List;
  tickets: Ticket[];
  onAddTicket: (listId: string) => void;
  onDeleteTicket: (id: string) => void;
  onOpenTicket: (t: Ticket) => void;
}

export const BoardList: React.FC<BoardListProps> = ({ list, tickets, onAddTicket, onDeleteTicket, onOpenTicket }) => {
  const { setNodeRef, isOver } = useDroppable({ id: list.id, data: { type: "List", list } });

  return (
    <div className="flex flex-col w-72 shrink-0">
      <div className="sticky top-0 z-10 backdrop-blur supports-backdrop-filter:bg-slate-900/80 bg-slate-900/60 rounded-t-md border border-b-0 border-slate-700 px-3 py-2">
        <div className="flex items-center justify-between">
          <h3 className="text-slate-100 font-semibold text-sm">{list.title}</h3>
          <span className="text-slate-400 text-xs">{tickets.length}</span>
        </div>
      </div>
      <div ref={setNodeRef} className={`min-h-32 flex-1 overflow-y-auto rounded-b-md border border-t-0 border-slate-700 p-3 space-y-2 ${isOver ? "bg-slate-800/40" : "bg-slate-900/40"}`}>
        <SortableContext items={tickets.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} onDelete={onDeleteTicket} onOpen={onOpenTicket} />
          ))}
        </SortableContext>
        <button onClick={() => onAddTicket(list.id)} className="w-full mt-2 text-left text-xs text-slate-300 hover:text-white py-1 px-2 rounded bg-slate-800/50 hover:bg-slate-800 border border-slate-700">
          + Add Task
        </button>
      </div>
    </div>
  );
};

export default BoardList;
