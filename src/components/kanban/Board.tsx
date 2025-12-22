"use client";
import React, { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  closestCorners,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { BoardList } from "./BoardList"; 
import { TicketContent } from "./Ticket";
import AddTicketModal from "./AddTicketModal";
import EditTicketModal from "./EditTicketModal";
import { KanbanProvider, useKanban } from "@/Providers/KanbanProvider";
import { Tables } from "@/types/database.types";

const KanbanBoardInner: React.FC = () => {
  const { lists, tickets, createTicket, updateTicketDetails, reorderTickets, deleteTicket } =
    useKanban();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addListId, setAddListId] = useState<string | null>(null);
  const [editingTicket, setEditingTicket] = useState<Tables<'ticket'> | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    })
  );

  const ticketsByList = useMemo(() => {
    const map: Record<string, Tables<'ticket'>[]> = {};
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

  function submitAddTicket(values: {
    title: string;
    description: string;
    deadline: string;
  }) {
    if (!addListId) return;
    const listTickets = tickets
      .filter((t) => t.list_id === addListId)
      .sort((a, b) => a.position - b.position);
    const nextPosition = listTickets.length;
    void createTicket({
      list_id: addListId,
      position: nextPosition,
      title: values.title,
      description: values.description,
      deadline: values.deadline || "",
    });
    setAddOpen(false);
    setAddListId(null);
  }

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    setActiveId(id);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    // No-op: visual reorder handled by DragOverlay; actual reorder on dragEnd
    const _activeId = active.id as UniqueIdentifier;
    const _overId = over.id as UniqueIdentifier;
  }

 function handleDragEnd(event: DragEndEvent) {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return;

      const activeId = String(active.id);
      const overId = String(over.id);

      const activeTicket = tickets.find((t) => t.id === activeId);
      if (!activeTicket) return;

      // Target list: if hovering a ticket, use its list; otherwise treat the droppable list id
      const overTicket = tickets.find((t) => t.id === overId);
      const targetListId = overTicket ? overTicket.list_id : overId;

      // Tickets in target list sorted by position
      const targetListTickets = tickets
        .filter((t) => t.list_id === targetListId)
        .sort((a, b) => a.position - b.position);

      // Determine intended drop index
      let dropIndex: number;
      if (!overTicket) {
        dropIndex = targetListTickets.length; // end of list
      } else {
        const overIndex = targetListTickets.findIndex((t) => t.id === overId);
        const activeIndexInTarget = targetListTickets.findIndex((t) => t.id === activeId);
        const movingDown = activeIndexInTarget !== -1 && activeIndexInTarget < overIndex;

        if (activeIndexInTarget === -1) {
          // Moving from another list: if hovering last ticket, place after it for easier drop-to-end
          const isOverLast = overIndex === targetListTickets.length - 1;
          dropIndex = isOverLast ? targetListTickets.length : overIndex;
        } else {
          // Same-list behavior
          dropIndex = movingDown ? overIndex + 1 : overIndex;
        }
      }

      // Compute new position by averaging neighbors
      const leftPos = dropIndex - 1 >= 0 ? targetListTickets[dropIndex - 1]?.position : undefined;
      const rightPos = dropIndex < targetListTickets.length ? targetListTickets[dropIndex]?.position : undefined;

      let newPosition: number;
      if (leftPos === undefined && rightPos === undefined) {
        newPosition = 0; // empty list
      } else if (leftPos === undefined && rightPos !== undefined) {
        newPosition = rightPos - 1; // before first
      } else if (leftPos !== undefined && rightPos === undefined) {
        newPosition = leftPos + 1; // after last
      } else {
        newPosition = (leftPos! + rightPos!) / 2; // between neighbors
      }

      // Avoid redundant update
      if (activeTicket.list_id === targetListId && activeTicket.position === newPosition) {
        return;
      }

      void updateTicketDetails(activeId, {
        list_id: targetListId,
        position: newPosition,
      } as any);
    }
  function handleDragCancel() {
    setActiveId(null);
  }

  return (
    <div className="w-full h-full overflow-x-auto p-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex gap-4 min-w-max h-full  items-start relative">
          {lists
            .sort((a, b) => a.position - b.position)
            .map((list) => (
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
          {activeId
            ? (() => {
                const activeTicket = tickets.find((t) => t.id === activeId);
                return activeTicket ? (
                  <div
                    className="pointer-events-none opacity-100 shadow-xl ring-1 ring-slate-700 rounded-md"
                    style={{ transform: "translateZ(0)" }}
                  >
                    <TicketContent ticket={activeTicket} />
                  </div>
                ) : null;
              })()
            : null}
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
        onSave={async (values) => {
          if (editingTicket) {
            await updateTicketDetails(editingTicket.id, values);
          }
          setEditingTicket(null);
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
