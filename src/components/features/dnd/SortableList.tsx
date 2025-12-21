
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Tables } from "@/types/database.types";
import { useMemo, useState } from "react";
import { SortableTicket } from "./SortableTicket";

interface SortableListProps {
    list: Tables<'list'>;
    tickets: Tables<'ticket'>[];
    onAddTicket: (listId: string, title: string) => void;
}

export function SortableList({ list, tickets, onAddTicket }: SortableListProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: list.id, data: { type: 'List' } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 0,
    };

    const [newTicketTitle, setNewTicketTitle] = useState('');

    const handleAddTicket = () => {
        if (newTicketTitle.trim()) {
            onAddTicket(list.id, newTicketTitle.trim());
            setNewTicketTitle('');
        }
    };

    const ticketIds = useMemo(() => tickets.map(ticket => ticket.id), [tickets]);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-gray-100 p-4 rounded-md shadow-md w-72 flex-shrink-0 mr-4"
        >
            <h3 className="font-bold text-lg mb-2" {...attributes} {...listeners}>
                {list.title}
            </h3>
            <div className="min-h-[50px] flex flex-col gap-2">
                <SortableContext items={ticketIds} strategy={verticalListSortingStrategy}>
                    {tickets.map(ticket => (
                        <SortableTicket key={ticket.id} ticket={ticket} />
                    ))}
                </SortableContext>
            </div>
            <div className="mt-4">
                <input
                    type="text"
                    placeholder="New ticket title"
                    value={newTicketTitle}
                    onChange={(e) => setNewTicketTitle(e.target.value)}
                    className="w-full p-2 border rounded-md mb-2"
                />
                <button
                    onClick={handleAddTicket}
                    className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                >
                    Add Ticket
                </button>
            </div>
        </div>
    );
}
