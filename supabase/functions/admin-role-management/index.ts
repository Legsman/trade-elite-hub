import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Increased propagation delay to ensure DB changes propagate fully
const PROPAGATION_DELAY_MS = 5000;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { targetUserId, role, action } = await req.json();
    console.log(`Admin role management request: ${action} ${role} for user ${targetUserId}`);

    if (!targetUserId || !role || !["add", "remove"].includes(action)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Invalid input" 
      }), { headers: corsHeaders, status: 400 });
    }

    // Validate role to make sure it's either 'admin' or 'verified'
    if (role !== 'admin' && role !== 'verified') {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Invalid role. Only 'admin' or 'verified' allowed." 
      }), { headers: corsHeaders, status: 400 });
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
      return new Response(JSON.stringify({ 
        success: false, 
        error: "No authorization provided" 
      }), { headers: corsHeaders, status: 401 });
    }
    const jwt = authHeader.replace("Bearer ", "");

    // Get user making the request
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(jwt);

    if (!user || userError) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: userError?.message || "Unauthorized" 
      }), { headers: corsHeaders, status: 401 });
    }

    console.log(`Request made by user: ${user.id}`);

    // Use the direct database query with service role to check if user is admin
    // This avoids potential recursion in RLS policies
    const { data: adminCheck, error: adminCheckError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");
    
    const isAdmin = adminCheck && adminCheck.length > 0;
    console.log(`Requesting user is admin: ${isAdmin}`);
    
    if (!isAdmin) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Admin only action" 
      }), { headers: corsHeaders, status: 403 });
    }

    // Only an admin can proceed!
    let resp;
    if (action === "add") {
      console.log(`Adding ${role} role for user ${targetUserId}`);
      
      // First check if the role already exists to prevent duplicate key errors
      const { data: existingRole, error: checkError } = await supabaseAdmin
        .from("user_roles")
        .select("*")
        .eq("user_id", targetUserId)
        .eq("role", role);
      
      if (checkError) {
        // Real error occurred
        console.error(`Error checking for existing role: ${checkError.message}`);
        return new Response(JSON.stringify({ 
          success: false, 
          error: checkError.message 
        }), { headers: corsHeaders, status: 400 });
      }
        
      if (existingRole && existingRole.length > 0) {
        console.log(`User ${targetUserId} already has role ${role}`);
        return new Response(JSON.stringify({ 
          success: true, 
          message: `Role ${role} already assigned` 
        }), { headers: corsHeaders });
      }
      
      // Insert role (if not present)
      resp = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: targetUserId, role });
        
    } else if (action === "remove") {
      console.log(`Removing ${role} role for user ${targetUserId}`);
      
      // First check if the role exists
      const { data: existingRole, error: checkError } = await supabaseAdmin
        .from("user_roles")
        .select("*")
        .eq("user_id", targetUserId)
        .eq("role", role);
      
      if (checkError) {
        // Real error occurred
        console.error(`Error checking for existing role: ${checkError.message}`);
        return new Response(JSON.stringify({ 
          success: false, 
          error: checkError.message 
        }), { headers: corsHeaders, status: 400 });
      }
      
      if (!existingRole || existingRole.length === 0) {
        console.log(`User ${targetUserId} doesn't have role ${role}`);
        return new Response(JSON.stringify({ 
          success: true, 
          message: `Role ${role} not found to remove` 
        }), { headers: corsHeaders });
      }
      
      // Remove the role
      resp = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", targetUserId)
        .eq("role", role);
    }

    if (resp && resp.error) {
      console.error(`${role} role management error:`, resp.error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: resp.error.message 
      }), { headers: corsHeaders, status: 400 });
    }

    // Add a significant delay to allow database changes to propagate fully
    console.log(`Waiting for database propagation (${PROPAGATION_DELAY_MS}ms)...`);
    await new Promise(resolve => setTimeout(resolve, PROPAGATION_DELAY_MS));
    
    console.log(`Successfully ${action === 'add' ? 'added' : 'removed'} ${role} role for user ${targetUserId}`);
    return new Response(JSON.stringify({ 
      success: true,
      message: `${role} role ${action === 'add' ? 'added' : 'removed'} successfully`
    }), { headers: corsHeaders });
  } catch (e) {
    console.error("Edge function error:", e);
    return new Response(JSON.stringify({ 
      success: false, 
      error: e.message || "Internal server error" 
    }), { headers: corsHeaders, status: 500 });
  }
});
