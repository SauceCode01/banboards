import { createClient } from "@supabase/supabase-js";


export const supabaseAdmin = createClient(
    process.env.SUPABASE_PROJECT_URL!, 
    process.env.SUPABASE_SECRET_KEY!
)