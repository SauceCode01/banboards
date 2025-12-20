export interface List {
  id: string; // Use "backlog", "todo", "in-progress", "done" as IDs
  board_id: number; // Default to 0
  title: string;
  position: number; // Fixed order: 0, 1, 2, 3
}

export interface Ticket {
  id: string; // Auto-generated UUID or random string
  list_id: string; // Foreign key to List
  position: number; // Order within the list
  title: string;
  description: string;
  deadline: string; // Date string
}
