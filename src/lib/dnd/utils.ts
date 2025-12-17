
import { supabase } from "@/lib/supabase/supabaseClient";

export const POSITION_GAP = 1000;
export const POSITION_THRESHOLD = 0.1;

export async function reNormalizePositions<T extends { id: string; position: number }>(
    items: T[],
    tableName: string,
    supabaseClient: typeof supabase
): Promise<T[]> {
    const sortedItems = [...items].sort((a, b) => a.position - b.position);
    const updates = sortedItems.map((item, index) => ({
        id: item.id,
        position: (index + 1) * POSITION_GAP,
    }));

    const { error } = await supabaseClient.from(tableName).upsert(updates);

    if (error) {
        console.error(`Error re-normalizing positions for ${tableName}:`, error);
        return items;
    }

    return items.map(item => {
        const updated = updates.find(u => u.id === item.id);
        return updated ? { ...item, position: updated.position } : item;
    });
}
