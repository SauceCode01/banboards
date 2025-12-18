import { useSortable } from "@dnd-kit/sortable";
import { Card, Id } from "./types";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

interface Props {
  card: Card;
  deleteCard: (id: Id) => void;
  updateCard: (id: Id, content: string) => void;
}

export function Card({ card, deleteCard, updateCard }: Props) {
  const [mouseIsOver, setMouseIsOver] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: "Card",
      card,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 bg-slate-700 p-3 h-[100px] min-h-[100px] items-center flex text-left rounded-lg border-2 border-indigo-500 cursor-grab relative"
      />
    );
  }

  if (editMode) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="bg-slate-700 p-3 h-[100px] min-h-[100px] items-center flex text-left rounded-lg hover:ring-2 hover:ring-inset hover:ring-indigo-500 cursor-grab relative border border-slate-600"
      >
        <textarea
          className="h-[90%] w-full resize-none border-none rounded bg-slate-800 text-white focus:outline-none p-2 text-sm"
          value={card.content}
          autoFocus
          placeholder="Card content here"
          onBlur={toggleEditMode}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.shiftKey) {
              toggleEditMode();
            }
          }}
          onChange={(e) => updateCard(card.id, e.target.value)}
        />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={toggleEditMode}
      className="bg-slate-700/80 backdrop-blur-sm p-3 h-[100px] min-h-[100px] items-center flex text-left rounded-lg hover:ring-2 hover:ring-inset hover:ring-indigo-500 cursor-grab relative card border border-slate-600/50 hover:bg-slate-700 transition-all duration-200 shadow-sm"
      onMouseEnter={() => {
        setMouseIsOver(true);
      }}
      onMouseLeave={() => {
        setMouseIsOver(false);
      }}
    >
      <p className="my-auto h-auto w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap text-slate-100 text-sm leading-relaxed">
        {card.content}
      </p>

      {mouseIsOver && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteCard(card.id);
          }}
          className="text-slate-400 hover:text-red-400 absolute right-2 top-2 bg-slate-800/80 p-1 rounded hover:bg-red-500/20 transition-colors text-sm font-bold w-6 h-6 flex items-center justify-center"
        >
          ×
        </button>
      )}
    </div>
  );
}
