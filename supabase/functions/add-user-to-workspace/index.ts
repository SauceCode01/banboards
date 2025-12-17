
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, workspace_id, role } = await req.json();

    if (!email || !workspace_id || !role) {
      return new Response(
        JSON.stringify({ error: "Missing email, workspace_id, or role" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Find the user by email
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();

    if (userError) {
      throw userError;
    }
    
    const targetUser = users.find(u => u.email === email);

    if (!targetUser) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }

    // Add user to workspace
    const { error: insertError } = await supabaseAdmin
      .from("workspace_member")
      .insert({
        workspace_id,
        user_id: targetUser.id,
        role,
      });

    if (insertError) {
      if (insertError.code === '23505') { // unique constraint violation
        return new Response(
          JSON.stringify({ error: "User is already a member of this workspace" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 409, // Conflict
          }
        );
      }
      throw insertError;
    }

    return new Response(
      JSON.stringify({ message: "User added to workspace successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
