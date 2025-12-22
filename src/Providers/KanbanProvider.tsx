"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "@/lib/supabase/supabaseClient";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/types/database.types";
import { useBoardContext } from "./BoardProvider";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface KanbanContextType {
  lists: Tables<"list">[];
  tickets: Tables<"ticket">[];
  createTicket: (ticket: TablesInsert<"ticket">) => Promise<void>;
  updateTicketDetails: (
    id: string,
    updates: Partial<TablesUpdate<"ticket">>
  ) => Promise<void>;
  reorderTickets: (
    ticketId: string,
    newListId: string,
    afterId: string
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

  const [lists, setLists] = useState<Tables<"list">[]>([]);
  const [tickets, setTickets] = useState<Tables<"ticket">[]>([]);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["kanbanData", activeBoardId],
    queryFn: async () => fetchBoardData(activeBoardId!),
    enabled: !!activeBoardId && activeBoardId !== "null",
  });

  useEffect(() => {
    if (data) {
      setLists(data.lists);
      setTickets(data.tickets);
    }
  }, [data]);

  // Clear state when there is no valid active board
  useEffect(() => {
    if (!activeBoardId || activeBoardId === "null") {
      setLists([]);
      setTickets([]);
    }
  }, [activeBoardId]);

  const queryClient = useQueryClient();

  async function createTicket(input: TablesInsert<"ticket">) {
    try {
      const insert: TablesInsert<"ticket"> = {
        list_id: input.list_id,
        position: tickets.length,
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
      setTickets((prev) => [...prev, committed]); 
      // invalidate the query key 
      await queryClient.invalidateQueries({queryKey: ["kanbanData", activeBoardId]});
    } catch (e) {
      console.log("An error occured while creating a ticket: ", input);
    }
  }

  async function updateTicketDetails(
    id: string,
    updates: TablesUpdate<"ticket">
  ) {
    const updated: TablesUpdate<"ticket"> = { ...updates };

    setTickets((prev) => {
      const newTickets = prev.map((ticket, i) => {
        if (ticket.id == id)
          return {
            ...ticket,
            ...updates,
          };
        else return ticket;
      });
      return newTickets;
    });

    try {
      const { error, data } = await supabase
        .from("ticket")
        .update({
          ...updated,
          deadline: updated.deadline || null,
        })
        .eq("id", id)
        .select()
        .single();
      console.log("update ticket result", { error, data });
      if (error || !data) throw error || new Error("Update failed");
      const committed = data as Tables<"ticket">;
      setTickets((prev) => prev.map((t) => (t.id === id ? committed : t)));

      
      // invalidate the query key 
      await queryClient.invalidateQueries({queryKey: ["kanbanData", activeBoardId]});
    } catch (e) {
      console.log("An error occured while updating a ticket: ", updates);
    }
  }

  async function reorderTickets(
    ticketId: string,
    newListId: string,
    afterId: string
  ) {
    console.log(
      "reorder tickets",
      ticketId,
      newListId,
      afterId,
      tickets,
      lists
    );
    const newList = lists.find((list) => list.id === newListId);
    if (!newList) {
      console.log("reorder to an invalid list");
      return;
    }

    const newListTickets = tickets
      .filter((ticket) => ticket.list_id === newList.id)
      .sort((a, b) => a.position - b.position);

    // calculating left and right position to average the new position of the ticket
    let leftPosition = 0;
    let rightPosition = 0;
    if (afterId == "start") leftPosition = newListTickets[0]?.position - 1 || 0;
    else {
      let leftIndex;
      const leftItem = newListTickets.find((ticket, i) => {
        if (ticket.id == afterId) {
          leftIndex = i;
          return true;
        }
      });
      if (!leftItem || !leftIndex) {
        console.log("invalid after id");
        return;
      }
      leftPosition = leftItem.position;

      if (leftIndex + 1 >= newListTickets.length)
        rightPosition = leftPosition + 1;
      else rightPosition = newListTickets[leftIndex + 1].position;
    }

    const newTicketPosition = (leftPosition + rightPosition) / 2;

    setTickets((prev) => {
      const newTickets = prev.map((ticket, i) => {
        if (ticket.id == ticketId)
          return {
            ...ticket,
            list_id: newListId,
            position: newTicketPosition,
          };
        else return ticket;
      });
      return newTickets;
    });

    try {
      const update: TablesUpdate<"ticket"> = {
        list_id: newListId,
        position: newTicketPosition,
      };
      console.log("updating ticket position", update);

      const { error, data } = await supabase
        .from("ticket")
        .update(update)
        .eq("id", ticketId)
        .select()
        .single();

      console.log("reorder result", { error, data });
      if (error) throw error;
      const updated = data as Tables<"ticket">;
    } catch (e) {
      console.log("failed to reorder a ticket. ", e);
    }

    
      // invalidate the query key 
      await queryClient.invalidateQueries({queryKey: ["kanbanData", activeBoardId]});
  }

  const value = useMemo<KanbanContextType>(
    () => ({
      lists,
      tickets,
      createTicket,
      updateTicketDetails,
      reorderTickets,
    }),
    [lists, tickets, tickets]
  );

  /**
   * REALTIME LISTENERS FOR KANBAN DATA
   */
  useEffect(() => {
    let channel: RealtimeChannel;

    const setupChannel = async () => {
      channel = supabase.channel("schema-db-changes-ticket");

      // handle insert
      channel.on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ticket" },
        (payload) => {
          const newTicket = payload.new as Tables<"ticket">;
          setTickets((prev) => {
            // check if it already exists
            if (prev.find((t) => t.id === newTicket.id)) return prev;
            return [...prev, newTicket];
          });
        }
      );

      // handle update
      channel.on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "ticket" },
        (payload) => {
          const updatedTicket = payload.new as Tables<"ticket">;
          setTickets((prev) =>
            prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
          );
        }
      );

      // handle delete
      channel.on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "ticket" },
        (payload) => {
          const deletedId = (payload.old as Tables<"ticket">).id;
          setTickets((prev) => prev.filter((t) => t.id !== deletedId));
        }
      );

      channel.subscribe((status, err) => {
        if (err) {
          console.error("Error subscribing to ticket changes:", err);
        } else {
          console.log("Subscribed to ticket changes with status:", status);
        }
      });
    };

    setupChannel();

    return () => {
      if (channel) void supabase.removeChannel(channel);
    };
  }, []);

  return (
    <KanbanContext.Provider value={value}>{children}</KanbanContext.Provider>
  );
};

export function useKanban(): KanbanContextType {
  const ctx = useContext(KanbanContext);
  if (!ctx) throw new Error("useKanban must be used within a KanbanProvider");
  return ctx;
}

const fetchBoardData = async (boardId: string) => {
  console.log("latest board id", boardId);
  if (!boardId || boardId === "null") {
    return { lists: [], tickets: [] };
  } 
  console.log("loading tickets", boardId);

  const { data: listRows, error: listErr } = await supabase
    .from("list")
    .select("*")
    .eq("board_id", boardId)
    .order("position", { ascending: true });

  if (listErr || !listRows) {
    return;
  }
  console.log("listrows", listRows, "board", boardId);

  const listIds = listRows.map((l) => l.id);
  const { data: ticketRows } = await supabase
    .from("ticket")
    .select("*")
    .in("list_id", listIds.length ? listIds : ["__none__"])
    .order("position", { ascending: true });

  console.log("list ids", listIds, "board", boardId);
  console.log("ticket rows", ticketRows, "board", boardId);

  console.log("DONEEEEEEEEEEEEEEEE", boardId);
  return { lists: listRows, tickets: ticketRows || [] };
};
