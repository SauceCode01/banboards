import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Tables } from "@/types/database.types";

interface SortableTicketProps {
    ticket: Tables<'ticket'>;
}

export function SortableTicket({ ticket }: SortableTicketProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: ticket.id, data: { type: 'Ticket', listId: ticket.list_id } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 5 : 0,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white p-3 rounded-md shadow-sm mb-2 cursor-grab"
            {...attributes}
            {...listeners}
        >
            <p className="font-medium">{ticket.title}</p>
            {ticket.description && <p className="text-sm text-gray-600">{ticket.description}</p>}
            {ticket.deadline && <p className="text-xs text-gray-500">Due: {new Date(ticket.deadline).toLocaleDateString()}</p>}
        </div>
    );
}
