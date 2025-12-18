"use client";
import React, { useMemo, useState, useCallback } from "react";
import { createPortal } from "react-dom";

import { BoardColumn } from "./BoardColumn";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { Card, Column, Id } from "./types";
import { Card as CardComponent } from "./Card";

const defaultCols = [
  {
    id: "todo",
    title: "Todo",
  },
  {
    id: "doing",
    title: "Work in progress",
  },
  {
    id: "done",
    title: "Done",
  },
] as Column[];

const defaultCards: Card[] = [
  {
    id: "1",
    columnId: "todo",
    content: "List admin APIs for dashboard",
  },
  {
    id: "2",
    columnId: "todo",
    content:
      "Develop user registration functionality with OTP delivered on SMS after email confirmation and phone number confirmation",
  },
  {
    id: "3",
    columnId: "doing",
    content: "Conduct security testing",
  },
  {
    id: "4",
    columnId: "doing",
    content: "Analyze competitors",
  },
  {
    id: "5",
    columnId: "done",
    content: "Create UI mockups",
  },
  {
    id: "6",
    columnId: "done",
    content: "Prepare documentation",
  },
  {
    id: "7",
    columnId: "done",
    content: "Release new version",
  },
  {
    id: "8",
    columnId: "todo",
    content: "Choose technology stack",
  },
  {
    id: "9",
    columnId: "todo",
    content: "Implement authentication",
  },
  {
    id: "10",
    columnId: "todo",
    content: "Set up project structure",
  },
  {
    id: "11",
    columnId: "doing",
    content: "Design database schema",
  },
  {
    id: "12",
    columnId: "doing",
    content: "Develop API for user management",
  },
];

export function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(defaultCols);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const [cards, setCards] = useState<Card[]>(defaultCards);

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

  const [activeCard, setActiveCard] = useState<Card | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  return (
    <div className="flex min-h-screen w-full items-start overflow-x-auto overflow-y-hidden p-6 bg-slate-950">
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="flex gap-6">
          <div className="flex gap-6">
            <SortableContext items={columnsId}>
              {columns.map((col) => (
                <BoardColumn
                  key={col.id}
                  column={col}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createCard={createCard}
                  deleteCard={deleteCard}
                  updateCard={updateCard}
                  cards={cards.filter((card) => card.columnId === col.id)}
                />
              ))}
            </SortableContext>
          </div>
          <button
            onClick={() => {
              createNewColumn();
            }}
            className="h-[60px] w-[320px] min-w-[320px] cursor-pointer rounded-lg bg-slate-800 border-2 border-slate-700 p-4 text-slate-400 hover:bg-slate-700 hover:border-indigo-500 hover:text-white transition-all duration-200 flex items-center justify-center gap-2 font-medium"
          >
            <span className="text-xl">+</span> Add Column
          </button>
        </div>

        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <BoardColumn
                column={activeColumn}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                createCard={createCard}
                deleteCard={deleteCard}
                updateCard={updateCard}
                cards={cards.filter(
                  (card) => card.columnId === activeColumn.id
                )}
              />
            )}
            {activeCard && (
              <CardComponent
                card={activeCard}
                deleteCard={deleteCard}
                updateCard={updateCard}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );

  const createCard = useCallback((columnId: Id) => {
    const newCard: Card = {
      id: generateId(),
      columnId,
      content: `Card ${cards.length + 1}`,
    };

    setCards(prevCards => [...prevCards, newCard]);
  }, [cards.length]);

  const deleteCard = useCallback((id: Id) => {
    setCards(prevCards => prevCards.filter((card) => card.id !== id));
  }, []);

  const updateCard = useCallback((id: Id, content: string) => {
    setCards(prevCards => prevCards.map((card) => {
      if (card.id !== id) return card;
      return { ...card, content };
    }));
  }, []);

  const createNewColumn = useCallback(() => {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };

    setColumns(prevColumns => [...prevColumns, columnToAdd]);
  }, [columns.length]);

  const deleteColumn = useCallback((id: Id) => {
    setColumns(prevColumns => prevColumns.filter((col) => col.id !== id));
    setCards(prevCards => prevCards.filter((c) => c.columnId !== id));
  }, []);

  const updateColumn = useCallback((id: Id, title: string) => {
    setColumns(prevColumns => prevColumns.map((col) => {
      if (col.id !== id) return col;
      return { ...col, title };
    }));
  }, []);

  const onDragStart = useCallback((event: DragStartEvent) => {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === "Card") {
      setActiveCard(event.active.data.current.card);
      return;
    }
  }, []);

  const onDragEnd = useCallback((event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveCard(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveAColumn = active.data.current?.type === "Column";
    if (!isActiveAColumn) return;

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex((col) => col.id === activeId);
      const overColumnIndex = columns.findIndex((col) => col.id === overId);
      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  }, []);

  const onDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveACard = active.data.current?.type === "Card";
    const isOverACard = over.data.current?.type === "Card";

    if (!isActiveACard) return;

    // Im dropping a Card over another Card
    if (isActiveACard && isOverACard) {
      setCards((cards) => {
        const activeIndex = cards.findIndex((t) => t.id === activeId);
        const overIndex = cards.findIndex((t) => t.id === overId);

        if (cards[activeIndex].columnId != cards[overIndex].columnId) {
          cards[activeIndex].columnId = cards[overIndex].columnId;
          return arrayMove(cards, activeIndex, overIndex - 1);
        }

        return arrayMove(cards, activeIndex, overIndex);
      });
    }

    const isOverAColumn = over.data.current?.type === "Column";

    // Im dropping a Card over a column
    if (isActiveACard && isOverAColumn) {
      setCards((cards) => {
        const activeIndex = cards.findIndex((t) => t.id === activeId);
        cards[activeIndex].columnId = overId;
        return arrayMove(cards, activeIndex, activeIndex);
      });
    }
  }, []);
}

function generateId() {
  /* Generate a random id */
  return Math.floor(Math.random() * 10001);
}

export default KanbanBoard;