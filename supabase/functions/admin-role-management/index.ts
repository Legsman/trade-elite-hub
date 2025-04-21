
import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { targetUserId, role, action } = await req.json();

    if (!targetUserId || !role || !["add", "remove"].includes(action)) {
      return new Response(JSON.stringify({ error: "Invalid input" }), { headers: corsHeaders, status: 400 });
    }

    // Create a Supabase client with the service role key
    // This bypasses RLS policies and prevents recursion
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Authenticate the caller
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization provided" }), { headers: corsHeaders, status: 401 });
    }
    const jwt = authHeader.replace("Bearer ", "");

    // Get user making the request
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(jwt);

    if (!user || userError) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { headers: corsHeaders, status: 401 });
    }

    // Use the security definer function to check if user is admin
    // This avoids potential recursion in RLS policies
    const { data: isAdmin } = await supabaseAdmin.rpc("is_admin", {
      _user_id: user.id,
    });
    
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin only" }), { headers: corsHeaders, status: 403 });
    }

    // Only an admin can proceed!
    let resp;
    if (action === "add") {
      // Insert admin role (if not present)
      resp = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: targetUserId, role }, { onConflict: "user_id,role" });
    } else if (action === "remove") {
      // Remove the admin role
      resp = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", targetUserId)
        .eq("role", role);
    }

    if (resp && resp.error) {
      console.error("Admin role management error:", resp.error);
      return new Response(JSON.stringify({ error: resp.error.message }), { headers: corsHeaders, status: 400 });
    }

    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
  } catch (e) {
    console.error("Edge function error:", e);
    return new Response(JSON.stringify({ error: e.message || "Internal server error" }), { headers: corsHeaders, status: 500 });
  }
});
