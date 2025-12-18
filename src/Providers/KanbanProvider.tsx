"use client";
import React, { createContext, useContext, useMemo, useState } from "react";
import type { List, Ticket } from "@/components/widgets/Kanban/types";

export interface KanbanContextType {
  lists: List[];
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

const DEFAULT_LISTS: List[] = [
  { id: "backlog", board_id: 0, title: "Backlog", position: 0 },
  { id: "todo", board_id: 0, title: "To Do", position: 1 },
  { id: "in-progress", board_id: 0, title: "In Progress", position: 2 },
  { id: "done", board_id: 0, title: "Done", position: 3 },
];

export const KanbanProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [lists] = useState<List[]>(DEFAULT_LISTS);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const value = useMemo<KanbanContextType>(
    () => ({ lists, tickets, setTickets }),
    [lists, tickets]
  );

  return (
    <KanbanContext.Provider value={value}>{children}</KanbanContext.Provider>
  );
};

export function useKanban(): KanbanContextType {
  const ctx = useContext(KanbanContext);
  if (!ctx) throw new Error("useKanban must be used within a KanbanProvider");
  return ctx;
}
