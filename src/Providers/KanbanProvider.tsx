"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "@/lib/supabase/supabaseClient";
import type { Tables, TablesInsert } from "@/types/database.types";
import type {
  List as UIList,
  Ticket as UITicket,
} from "@/components/widgets/Kanban/types";
import { useBoardContext } from "./BoardProvider";

export interface KanbanContextType {
  lists: UIList[];
  tickets: UITicket[];
  createTicket: (ticket: Omit<UITicket, "id">) => Promise<void>;
  updateTicketDetails: (
    id: string,
    updates: Partial<Pick<UITicket, "title" | "description" | "deadline">>
  ) => Promise<void>;
  reorderTickets: (
    ticketId: string,
    newListId: string,
    newPosition: number
  ) => Promise<void>;
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export const KanbanProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { activeBoardId } = useBoardContext();

  const [lists, setLists] = useState<UIList[]>([]);
  const [tickets, setTickets] = useState<UITicket[]>([]);

  const [committedLists, setCommittedLists] = useState<Tables<"list">[]>([]);
  const [committedTickets, setCommittedTickets] = useState<Tables<"ticket">[]>(
    []
  );

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!activeBoardId) {
        if (mounted) {
          setLists([]);
          setTickets([]);
          setCommittedLists([]);
          setCommittedTickets([]);
        }
        return;
      }

      const { data: listRows, error: listErr } = await supabase
        .from("list")
        .select("*")
        .eq("board_id", activeBoardId)
        .order("position", { ascending: true });

      if (listErr || !listRows) {
        if (mounted) {
          setLists([]);
          setCommittedLists([]);
        }
        return;
      }

      const listIds = listRows.map((l) => l.id);
      const { data: ticketRows } = await supabase
        .from("ticket")
        .select("*")
        .in("list_id", listIds.length ? listIds : ["__none__"])
        .order("position", { ascending: true });

      if (mounted) {
        const uiLists: UIList[] = listRows.map((l) => ({
          id: l.id,
          board_id: 0,
          title: l.title,
          position: l.position,
        }));
        const uiTickets: UITicket[] = (ticketRows || []).map((t) => ({
          id: t.id,
          list_id: t.list_id,
          position: t.position,
          title: t.title,
          description: t.description || "",
          deadline: t.deadline || "",
        }));
        setCommittedLists(listRows);
        setCommittedTickets(ticketRows || []);
        setLists(uiLists);
        setTickets(uiTickets);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [activeBoardId]);

  async function createTicket(input: Omit<UITicket, "id">) {
    const listTickets = tickets
      .filter((t) => t.list_id === input.list_id)
      .sort((a, b) => a.position - b.position);
    const position =
      typeof input.position === "number" ? input.position : listTickets.length;
    const tempId = `tmp_${uid()}`;
    const optimistic: UITicket = {
      id: tempId,
      list_id: input.list_id,
      position,
      title: input.title,
      description: input.description || "",
      deadline: input.deadline || "",
    };
    setTickets((prev) => [...prev, optimistic]);

    try {
      const insert: TablesInsert<"ticket"> = {
        list_id: input.list_id,
        position,
        title: input.title,
        description: input.description || null,
        deadline: input.deadline || null,
      };
      const { data, error } = await supabase
        .from("ticket")
        .insert(insert)
        .select()
        .single();
      if (error || !data) throw error || new Error("Insert failed");
      const committed = data as Tables<"ticket">;
      setCommittedTickets((prev) => [...prev, committed]);
      setTickets((prev) =>
        prev.map((t) =>
          t.id === tempId
            ? {
                id: committed.id,
                list_id: committed.list_id,
                position: committed.position,
                title: committed.title,
                description: committed.description || "",
                deadline: committed.deadline || "",
              }
            : t
        )
      );
    } catch (e) {
      setTickets(
        committedTickets.map((t) => ({
          id: t.id,
          list_id: t.list_id,
          position: t.position,
          title: t.title,
          description: t.description || "",
          deadline: t.deadline || "",
        }))
      );
    }
  }

  async function updateTicketDetails(
    id: string,
    updates: Partial<Pick<UITicket, "title" | "description" | "deadline">>
  ) {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              ...(updates.title !== undefined ? { title: updates.title } : {}),
              ...(updates.description !== undefined
                ? { description: updates.description ?? "" }
                : {}),
              ...(updates.deadline !== undefined
                ? { deadline: updates.deadline ?? "" }
                : {}),
            }
          : t
      )
    );

    const existsOnServer = committedTickets.some((t) => t.id === id);
    if (!existsOnServer) return;

    try {
      const dbDescription =
        updates.description !== undefined
          ? updates.description === ""
            ? null
            : updates.description
          : undefined;
      const dbDeadline =
        updates.deadline !== undefined
          ? updates.deadline === ""
            ? null
            : updates.deadline
          : undefined;

      const { error, data } = await supabase
        .from("ticket")
        .update({
          ...(updates.title !== undefined ? { title: updates.title } : {}),
          ...(updates.description !== undefined ? { description: dbDescription } : {}),
          ...(updates.deadline !== undefined ? { deadline: dbDeadline } : {}),
        })
        .eq("id", id)
        .select()
        .single();
      if (error || !data) throw error || new Error("Update failed");
      const committed = data as Tables<"ticket">;
      setCommittedTickets((prev) =>
        prev.map((t) => (t.id === id ? committed : t))
      );
    } catch (e) {
      setTickets(
        committedTickets.map((t) => ({
          id: t.id,
          list_id: t.list_id,
          position: t.position,
          title: t.title,
          description: t.description || "",
          deadline: t.deadline || "",
        }))
      );
    }
  }

  async function reorderTickets(
    ticketId: string,
    newListId: string,
    newPosition: number
  ) {
    console.log("REORDER TICKETS", ticketId, newListId, newPosition);
    const current = tickets.map((t) => ({ ...t }));
    const moved = current.find((t) => t.id === ticketId);
    if (!moved) return;
    const sourceListId = moved.list_id;
    // Reorder within the same list
    if (sourceListId === newListId) {
      console.log("REORDER WITHIN SAME LIST");
      const sameList = current
        .filter((t) => t.list_id === sourceListId && t.id !== ticketId)
        .sort((a, b) => a.position - b.position);
      const insertIndex = Math.max(
        0,
        Math.min(Math.floor(newPosition), sameList.length)
      );
      const reordered = [
        ...sameList.slice(0, insertIndex),
        { ...moved },
        ...sameList.slice(insertIndex),
      ];
      reordered.forEach((t, idx) => (t.position = idx));
      const others = current.filter((t) => t.list_id !== sourceListId);
      setTickets([...others, ...reordered]);

      const changed = reordered.map((t) => ({
        id: t.id,
        list_id: t.list_id,
        position: t.position,
        title: t.title,
        description: t.description || "", 
      }));
      const tempMove = !committedTickets.some((t) => t.id === ticketId);
      if (tempMove) return;
      console.log("before DATABASE STUFF SAME LIST");
      console.log(changed);
      try {
        const { error, data } = await supabase
          .from("ticket")
          .upsert(changed)
          .select();
        console.log(error, data, "REORDERRRRRRR SAME LIST");
        if (error) throw error;
        const updated = (data || []) as Tables<"ticket">[];
        setCommittedTickets((prev) => {
          const map = new Map(prev.map((t) => [t.id, t]));
          updated.forEach((u) => map.set(u.id, u));
          return Array.from(map.values());
        });
      } catch (e) {
        setTickets(
          committedTickets.map((t) => ({
            id: t.id,
            list_id: t.list_id,
            position: t.position,
            title: t.title,
            description: t.description || "",
            deadline: t.deadline || "",
          }))
        );
      }
      return;
    }

    // Move across different lists
    const source = current
      .filter((t) => t.list_id === sourceListId && t.id !== ticketId)
      .sort((a, b) => a.position - b.position);
    const target = current
      .filter((t) => t.list_id === newListId && t.id !== ticketId)
      .sort((a, b) => a.position - b.position);
    const insertIndex = Math.max(
      0,
      Math.min(Math.floor(newPosition), target.length)
    );
    const newTarget = [
      ...target.slice(0, insertIndex),
      { ...moved, list_id: newListId },
      ...target.slice(insertIndex),
    ];

    source.forEach((t, idx) => (t.position = idx));
    newTarget.forEach((t, idx) => (t.position = idx));

    const nextUI = current
      .filter((t) => t.list_id !== sourceListId && t.list_id !== newListId)
      .concat(source)
      .concat(newTarget);
    setTickets(nextUI);

    const changed = [...source, ...newTarget].map((t) => ({
      id: t.id,
      list_id: t.list_id,
      position: t.position,
      title: t.title,
      description: t.description || "",
    }));
    const tempMove = !committedTickets.some((t) => t.id === ticketId);
    if (tempMove) return;

    console.log("before DATABASE STUFF")

    try {
      const { error, data } = await supabase
        .from("ticket")
        .upsert(changed)
        .select();

        console.log(error, data, "REORDERRRRRRR");
      if (error) throw error;
      const updated = (data || []) as Tables<"ticket">[];
      setCommittedTickets((prev) => {
        const map = new Map(prev.map((t) => [t.id, t]));
        updated.forEach((u) => map.set(u.id, u));
        return Array.from(map.values());
      });
    } catch (e) {
      setTickets(
        committedTickets.map((t) => ({
          id: t.id,
          list_id: t.list_id,
          position: t.position,
          title: t.title,
          description: t.description || "",
          deadline: t.deadline || "",
        }))
      );
    }
  }

  const value = useMemo<KanbanContextType>(
    () => ({
      lists,
      tickets,
      createTicket,
      updateTicketDetails,
      reorderTickets,
    }),
    [lists, tickets, committedTickets]
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
