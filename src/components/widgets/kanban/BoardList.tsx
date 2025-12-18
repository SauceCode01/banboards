import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { List, Id, Ticket } from "./types";
import { CSS } from "@dnd-kit/utilities";
import React, { useMemo, useState } from "react";
import { Ticket as TicketComponent } from "./Ticket";
import AddTicketModal from "./AddTicketModal";

interface Props {
  list: List;
  deleteList: (id: Id) => void;
  updateList: (id: Id, title: string) => void;

  createTicket: (listId: Id, title: string) => void;
  updateTicket: (id: Id, content: string) => void;
  deleteTicket: (id: Id) => void;
  tickets: Ticket[];
}

export function BoardList({
  list,
  deleteList,
  updateList,
  createTicket,
  tickets,
  deleteTicket,
  updateTicket,
}: Props) {
  const [editMode, setEditMode] = useState(false);
  const [isAddTicketModalOpen, setIsAddTicketModalOpen] = useState(false);

  const ticketsIds = useMemo(() => {
    return tickets.map((ticket) => ticket.id);
  }, [tickets]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id,
    data: {
      type: "List",
      list,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const handleAddTicket = (title: string) => {
    createTicket(list.id, title);
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-slate-800 opacity-40 border-2 border-indigo-500 w-[320px] h-[500px] max-h-[500px] rounded-lg flex flex-col"
      ></div>
    );
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="bg-slate-800/50 backdrop-blur-sm w-[320px] h-[500px] max-h-[500px] rounded-lg flex flex-col border border-slate-700 shadow-lg"
      >
        {/* List title */}
        <div
          {...attributes}
          {...listeners}
          onClick={() => {
            setEditMode(true);
          }}
          className="bg-slate-900/80 text-md h-[60px] cursor-grab rounded-lg rounded-b-none p-3 font-bold border-b border-slate-600 flex items-center justify-between text-white"
        >
          <div className="flex gap-3">
            <div className="flex justify-center items-center bg-slate-700 px-2 py-1 text-sm rounded-full text-slate-300 min-w-[24px]">
              {tickets.length}
            </div>
            {!editMode && (
              <span className="text-white font-medium">{list.title}</span>
            )}
            {editMode && (
              <input
                className="bg-slate-800 text-white focus:border-indigo-500 border border-slate-600 rounded outline-none px-2 py-1 text-sm"
                value={list.title}
                onChange={(e) => updateList(list.id, e.target.value)}
                autoFocus
                onBlur={() => {
                  setEditMode(false);
                }}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  setEditMode(false);
                }}
              />
            )}
          </div>
          <button
            onClick={() => {
              deleteList(list.id);
            }}
            className="text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded p-1 transition-colors text-sm font-bold"
          >
            ×
          </button>
        </div>

        {/* List ticket container */}
        <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
          <SortableContext items={ticketsIds}>
            {tickets.map((ticket) => (
              <TicketComponent
                key={ticket.id}
                ticket={ticket}
                deleteTicket={deleteTicket}
                updateTicket={updateTicket}
              />
            ))}
          </SortableContext>
        </div>
        {/* List footer */}
        <button
          className="flex gap-2 items-center justify-center border-slate-600 border-2 border-dashed rounded-lg p-3 m-2 text-slate-400 hover:bg-slate-700/50 hover:text-white hover:border-indigo-500 transition-all duration-200 font-medium"
          onClick={() => {
            setIsAddTicketModalOpen(true);
          }}
        >
          <span className="text-lg">+</span> Add Ticket
        </button>
      </div>
      <AddTicketModal
        isOpen={isAddTicketModalOpen}
        onClose={() => setIsAddTicketModalOpen(false)}
        onAddTicket={handleAddTicket}
      />
    </>
  );
}
