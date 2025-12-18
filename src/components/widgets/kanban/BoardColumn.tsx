import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { Column, Id, Card } from "./types";
import { CSS } from "@dnd-kit/utilities";
import React, { useMemo, useState } from "react";
import { Card as CardComponent } from "./Card";

interface Props {
  column: Column;
  deleteColumn: (id: Id) => void;
  updateColumn: (id: Id, title: string) => void;

  createCard: (columnId: Id) => void;
  updateCard: (id: Id, content: string) => void;
  deleteCard: (id: Id) => void;
  cards: Card[];
}

export function BoardColumn({
  column,
  deleteColumn,
  updateColumn,
  createCard,
  cards,
  deleteCard,
  updateCard,
}: Props) {
  const [editMode, setEditMode] = useState(false);

  const cardsIds = useMemo(() => {
    return cards.map((card) => card.id);
  }, [cards]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
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
    <div
      ref={setNodeRef}
      style={style}
      className="bg-slate-800/50 backdrop-blur-sm w-[320px] h-[500px] max-h-[500px] rounded-lg flex flex-col border border-slate-700 shadow-lg"
    >
      {/* Column title */}
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
            {cards.length}
          </div>
          {!editMode && <span className="text-white font-medium">{column.title}</span>}
          {editMode && (
            <input
              className="bg-slate-800 text-white focus:border-indigo-500 border border-slate-600 rounded outline-none px-2 py-1 text-sm"
              value={column.title}
              onChange={(e) => updateColumn(column.id, e.target.value)}
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
            deleteColumn(column.id);
          }}
          className="text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded p-1 transition-colors text-sm font-bold"
        >
          ×
        </button>
      </div>

      {/* Column card container */}
      <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
        <SortableContext items={cardsIds}>
          {cards.map((card) => (
            <CardComponent
              key={card.id}
              card={card}
              deleteCard={deleteCard}
              updateCard={updateCard}
            />
          ))}
        </SortableContext>
      </div>
      {/* Column footer */}
      <button
        className="flex gap-2 items-center justify-center border-slate-600 border-2 border-dashed rounded-lg p-3 m-2 text-slate-400 hover:bg-slate-700/50 hover:text-white hover:border-indigo-500 transition-all duration-200 font-medium"
        onClick={() => {
          createCard(column.id);
        }}
      >
        <span className="text-lg">+</span> Add card
      </button>
    </div>
  );
}
