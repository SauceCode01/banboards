"use client";
import React, { useMemo, useState } from "react";
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, MouseSensor, TouchSensor, UniqueIdentifier, closestCorners, useSensor, useSensors, DragOverlay } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { BoardList } from "./BoardList";
import type { Ticket } from "./types";
import { TicketContent } from "./Ticket";
import AddTicketModal from "./AddTicketModal";
import EditTicketModal from "./EditTicketModal";
import { KanbanProvider, useKanban } from "@/Providers/KanbanProvider";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const KanbanBoardInner: React.FC = () => {
  const { lists, tickets, setTickets } = useKanban();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addListId, setAddListId] = useState<string | null>(null);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const ticketsByList = useMemo(() => {
    const map: Record<string, Ticket[]> = {};
    for (const list of lists) map[list.id] = [];
    for (const t of tickets) {
      if (!map[t.list_id]) map[t.list_id] = [];
      map[t.list_id].push(t);
    }
    for (const listId of Object.keys(map)) {
      map[listId].sort((a, b) => a.position - b.position);
    }
    return map;
  }, [lists, tickets]);

  function addTicket(listId: string) {
    setAddListId(listId);
    setAddOpen(true);
  }

  function submitAddTicket(values: { title: string; description: string; deadline: string }) {
    if (!addListId) return;
    const listTickets = tickets.filter((t) => t.list_id === addListId).sort((a, b) => a.position - b.position);
    const nextPosition = listTickets.length; // place at bottom
    const newTicket: Ticket = {
      id: uid(),
      list_id: addListId,
      position: nextPosition,
      title: values.title,
      description: values.description,
      deadline: values.deadline || "",
    };
    setTickets((prev) => [...prev, newTicket]);
    setAddOpen(false);
    setAddListId(null);
  }

  function deleteTicket(id: string) {
    setTickets((prev) => {
      const toDelete = prev.find((t) => t.id === id);
      if (!toDelete) return prev;
      const remaining = prev.filter((t) => t.id !== id);
      // Reindex positions in the same list
      const sameList = remaining.filter((t) => t.list_id === toDelete.list_id).sort((a, b) => a.position - b.position);
      sameList.forEach((t, idx) => (t.position = idx));
      return [...remaining];
    });
  }

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    setActiveId(id);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as UniqueIdentifier;
    const overId = over.id as UniqueIdentifier;

    // If dragging a ticket over a different ticket, and lists differ, move between lists
    const activeTicket = tickets.find((t) => t.id === String(activeId));
    if (!activeTicket) return;

    // Over could be a list container or a ticket
    const overIsList = lists.some((l) => l.id === overId);
    const targetListId = overIsList
      ? String(overId)
      : tickets.find((t) => t.id === String(overId))?.list_id;

    if (!targetListId || targetListId === activeTicket.list_id) return;

    setTickets((prev) => {
      const updated = prev.map((t) => ({ ...t }));
      const fromListId = activeTicket.list_id;
      // Remove from old list order
      const fromList = updated.filter((t) => t.list_id === fromListId).sort((a, b) => a.position - b.position);
      const movingIndex = fromList.findIndex((t) => t.id === activeTicket.id);
      if (movingIndex !== -1) {
        fromList.splice(movingIndex, 1);
        fromList.forEach((t, idx) => (t.position = idx));
      }
      // Insert at end of new list for now; final index set in onDragEnd
      const toList = updated.filter((t) => t.list_id === targetListId).sort((a, b) => a.position - b.position);
      activeTicket.list_id = targetListId;
      activeTicket.position = toList.length;
      return updated;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeTicket = tickets.find((t) => t.id === activeId);
    if (!activeTicket) return;

    const overIsList = lists.some((l) => l.id === overId);
    const targetListId = overIsList ? overId : tickets.find((t) => t.id === overId)?.list_id;
    if (!targetListId) return;

    setTickets((prev) => {
      // Build ticket arrays by list
      const updated = prev.map((t) => ({ ...t }));
      const listTickets = updated
        .filter((t) => t.list_id === targetListId)
        .sort((a, b) => a.position - b.position);

      const oldListTickets = updated
        .filter((t) => t.list_id !== targetListId && t.id === activeId)
        .map((t) => t.list_id);

      const currentlyInTarget = listTickets.find((t) => t.id === activeId);
      const overIndex = overIsList
        ? listTickets.length // drop to end
        : listTickets.findIndex((t) => t.id === overId);

      // If the ticket isn't yet in the target list array, put it at the end first
      if (!currentlyInTarget) {
        const moved = updated.find((t) => t.id === activeId)!;
        moved.list_id = targetListId;
        moved.position = listTickets.length;
        listTickets.push(moved);
      }

      const activeIndex = listTickets.findIndex((t) => t.id === activeId);
      const newIndex = overIndex < 0 ? listTickets.length - 1 : overIndex;
      const reorderedIds = arrayMove(listTickets.map((t) => t.id), activeIndex, newIndex);

      // Apply new positions back to updated
      reorderedIds.forEach((id, idx) => {
        const t = updated.find((x) => x.id === id)!;
        t.list_id = targetListId;
        t.position = idx;
      });

      // Reindex positions in any source list that changed
      if (oldListTickets.length) {
        const sourceListId = oldListTickets[0];
        const source = updated.filter((t) => t.list_id === sourceListId).sort((a, b) => a.position - b.position);
        source.forEach((t, idx) => (t.position = idx));
      }

      return updated;
    });
    setActiveId(null);
  }
  function handleDragCancel() {
    setActiveId(null);
  }

  return (
    <div className="w-full h-full overflow-x-auto p-4">
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
        <div className="flex gap-4 min-w-max">
          {lists.sort((a, b) => a.position - b.position).map((list) => (
            <BoardList
              key={list.id}
              list={list}
              tickets={(ticketsByList[list.id] || []).map((t) => ({ ...t }))}
              onAddTicket={addTicket}
              onDeleteTicket={deleteTicket}
              onOpenTicket={(t) => setEditingTicket(t)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeId ? (
            (() => {
              const activeTicket = tickets.find((t) => t.id === activeId);
              return activeTicket ? (
                <div className="pointer-events-none opacity-100 shadow-xl ring-1 ring-slate-700 rounded-md" style={{ transform: "translateZ(0)" }}>
                  <TicketContent ticket={activeTicket} />
                </div>
              ) : null;
            })()
          ) : null}
        </DragOverlay>
      </DndContext>
      <AddTicketModal
        isOpen={addOpen}
        onClose={() => {
          setAddOpen(false);
          setAddListId(null);
        }}
        listName={lists.find((l) => l.id === addListId)?.title}
        onSubmit={submitAddTicket}
      />
      <EditTicketModal
        ticket={editingTicket}
        onClose={() => setEditingTicket(null)}
        onSave={(values) => {
          setTickets((prev) => prev.map((t) => (t.id === editingTicket?.id ? { ...t, ...values } : t)));
        }}
      />
    </div>
  );
};

export const KanbanBoard: React.FC = () => (
  <KanbanProvider>
    <KanbanBoardInner />
  </KanbanProvider>
);

export default KanbanBoard;
