"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { supabase } from "@/lib/supabase/supabaseClient";
import { Tables } from "@/types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SortableList } from "../features/dnd/SortableList"; 

interface BoardViewProps {
  boardId: string;
}

export default function BoardView({ boardId }: BoardViewProps) {
  const [lists, setLists] = useState<Tables<"list">[]>([]);
  const [tickets, setTickets] = useState<Tables<"ticket">[]>([]);
  const [newListName, setNewListName] = useState("");

  // Dnd-kit sensors for drag interactions
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // --- Data Fetching ---
  useEffect(() => {
    async function fetchData() {
      // Fetch lists for the board, ordered by position
      const { data: listsData, error: listsError } = await supabase
        .from("list")
        .select("*")
        .eq("board_id", boardId)
        .order("position", { ascending: true });

      if (listsError) {
        console.error("Error fetching lists:", listsError);
        return;
      }
      setLists(listsData || []);

      // Fetch all tickets for the board, ordered by position
      // Filter by list_id in rendering to ensure tickets belong to fetched lists
      const { data: ticketsData, error: ticketsError } = await supabase
        .from("ticket")
        .select("*")
        .in("list_id", listsData?.map((list) => list.id) || [])
        .order("position", { ascending: true });

      if (ticketsError) {
        console.error("Error fetching tickets:", ticketsError);
        return;
      }
      setTickets(ticketsData || []);
    }

    fetchData();
  }, [boardId]);

  // Memoized list IDs for SortableContext
  const listIds = useMemo(() => lists.map((list) => list.id), [lists]);

  // Renormalize positions to consecutive integers and persist to DB
  async function reNormalizePositions<T extends { id: string; position: number }>(
    items: T[],
    table: "list" | "ticket",
    client: SupabaseClient
  ): Promise<T[]> {
    const sorted = [...items].sort((a, b) => a.position - b.position);
    const updated: T[] = [];
    for (let i = 0; i < sorted.length; i++) {
      const item = sorted[i];
      const newPos = i + 1;
      if (item.position !== newPos) {
        const { error } = await client.from(table).update({ position: newPos }).eq("id", item.id);
        if (error) {
          console.error(`Failed to renormalize ${table} position`, { id: item.id, error });
          // Continue; keep previous position if update fails
          updated.push(item);
          continue;
        }
        updated.push({ ...item, position: newPos });
      } else {
        updated.push(item);
      }
    }
    return updated;
  }

  // --- Create New List ---
  const handleAddList = async () => {
    if (newListName.trim()) {
      // Calculate position for the new list (at the end)
      const newPosition =
        lists.length > 0
          ? lists[lists.length - 1].position + 1
          : 1;
      const { data, error } = await supabase
        .from("list")
        .insert({
          title: newListName.trim(),
          board_id: boardId,
          position: newPosition,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating list:", error);
        return;
      }

      if (data) {
        setLists((prev) => [...prev, data]);
        setNewListName("");
      }
    }
  };

  // --- Create New Ticket ---
  const handleAddTicket = async (listId: string, title: string) => {
    const ticketsInList = tickets.filter((t) => t.list_id === listId);
    // Calculate position for the new ticket (at the end of its list)
    const newPosition =
      ticketsInList.length > 0
        ? ticketsInList.sort((a, b) => a.position - b.position)[
            ticketsInList.length - 1
          ].position + 1
        : 1;

    const { data, error } = await supabase
      .from("ticket")
      .insert({ title, list_id: listId, position: newPosition })
      .select()
      .single();

    if (error) {
      console.error("Error creating ticket:", error);
      return;
    }

    if (data) {
      setTickets((prev) => [...prev, data]);
    }
  };

  // --- Drag End Handler ---
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return; // Dropped outside any droppable area

    const activeId = active.id as string;
    const overId = over.id as string;
    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeId === overId) return; // Dropped on itself

    // --- Handle List Dragging ---
    if (activeType === "List" && overType === "List") {
      const oldIndex = lists.findIndex((list) => list.id === activeId);
      const newIndex = lists.findIndex((list) => list.id === overId);

      if (oldIndex === -1 || newIndex === -1) return;

      const newLists = [...lists];
      const [movedList] = newLists.splice(oldIndex, 1);
      newLists.splice(newIndex, 0, movedList);
      setLists(newLists);

      let newPosition: number;
      if (newIndex === 0) {
        newPosition = newLists[1].position / 2;
      } else if (newIndex === newLists.length - 1) {
        newPosition = newLists[newLists.length - 2].position + 1;
      } else {
        newPosition =
          (newLists[newIndex - 1].position + newLists[newIndex + 1].position) /
          2;
      }

      const needsRenormalization = newLists.some((list, i) => {
        if (i === 0) return false;
        return list.position - newLists[i - 1].position < 0.00001;
      });

      if (needsRenormalization) {
        const renormalizedLists = await reNormalizePositions(
          newLists,
          "list",
          supabase
        );
        setLists(renormalizedLists);
      } else {
        await supabase
          .from("list")
          .update({ position: newPosition })
          .eq("id", activeId);
      }
    }

    // --- Handle Ticket Dragging ---
    if (activeType === "Ticket") {
      const activeTicket = tickets.find((t) => t.id === activeId);
      if (!activeTicket) return;

      let targetListId: string = "";

      if (overType === "List") {
        targetListId = overId;
      } else if (overType === "Ticket") {
        const overTicket = tickets.find((t) => t.id === overId);
        if (overTicket) {
          targetListId = overTicket.list_id;
        }
      }
      if (!targetListId) return;

      const ticketsInTargetList = tickets
        .filter((t) => t.list_id === targetListId)
        .sort((a, b) => a.position - b.position);
      const activeIndex = tickets.findIndex((t) => t.id === activeId);
      const overIndex = ticketsInTargetList.findIndex((t) => t.id === overId);

      let newPosition: number;

      if (overId && overType === "Ticket") {
        if (overIndex === 0) {
          newPosition = ticketsInTargetList[0].position / 2;
        } else if (overIndex === ticketsInTargetList.length - 1) {
          newPosition =
            ticketsInTargetList[ticketsInTargetList.length - 1].position +
            1;
        } else {
          newPosition =
            (ticketsInTargetList[overIndex - 1].position +
              ticketsInTargetList[overIndex].position) /
            2;
        }
      } else {
        // Dropped on a list, not a ticket
        newPosition =
          ticketsInTargetList.length > 0
            ? ticketsInTargetList[ticketsInTargetList.length - 1].position +
              1
            : 1;
      }

      const newTickets = [...tickets];
      newTickets[activeIndex] = {
        ...newTickets[activeIndex],
        list_id: targetListId,
        position: newPosition,
      };
      setTickets(newTickets.sort((a, b) => a.position - b.position));

      const needsRenormalization = ticketsInTargetList.some((ticket, i) => {
        if (i === 0) return false;
        return (
          ticket.position - ticketsInTargetList[i - 1].position <
          0.00001
        );
      });

      if (needsRenormalization) {
        const renormalizedTickets = await reNormalizePositions(
          ticketsInTargetList,
          "ticket",
          supabase
        );
        const updatedTickets = newTickets.map(
          (t) => renormalizedTickets.find((rt) => rt.id === t.id) || t
        );
        setTickets(updatedTickets.sort((a, b) => a.position - b.position));
      } else {
        await supabase
          .from("ticket")
          .update({ position: newPosition, list_id: targetListId })
          .eq("id", activeId);
      }
    }
  };

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className="p-4 flex flex-col h-screen">
          <h1 className="text-2xl font-bold mb-4">Board: {boardId}</h1>

          <div className="flex overflow-x-auto pb-4">
            <SortableContext
              items={listIds}
              strategy={horizontalListSortingStrategy}
            >
              {lists.map((list) => (
                <SortableList
                  key={list.id}
                  list={list}
                  tickets={tickets
                    .filter((ticket) => ticket.list_id === list.id)
                    .sort((a, b) => a.position - b.position)}
                  onAddTicket={handleAddTicket}
                />
              ))}
            </SortableContext>

            <div className="w-72 flex-shrink-0 p-4 bg-gray-50 rounded-md shadow-md">
              <input
                type="text"
                placeholder="New list title"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="w-full p-2 border rounded-md mb-2"
              />
              <button
                onClick={handleAddList}
                className="w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
              >
                Add List
              </button>
            </div>
          </div>
        </div>
      </DndContext>
    </div>
  );
}
