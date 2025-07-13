
import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Reduced propagation delay to 2 seconds to match frontend timing
const PROPAGATION_DELAY_MS = 2000;

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

    // Validate role to make sure it's either 'admin', 'verified', or 'trader'
    if (role !== 'admin' && role !== 'verified' && role !== 'trader') {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Invalid role. Only 'admin', 'verified', or 'trader' allowed." 
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

      // Handle role transitions to ensure only one verification role at a time
      if (resp && !resp.error) {
        if (role === 'verified') {
          // When adding verified, remove unverified role if it exists
          console.log(`Removing unverified role for user ${targetUserId} after adding verified`);
          await supabaseAdmin
            .from("user_roles")
            .delete()
            .eq("user_id", targetUserId)
            .eq("role", "unverified");
        } else if (role === 'trader') {
          // When adding trader, remove both unverified and verified roles if they exist
          console.log(`Removing unverified and verified roles for user ${targetUserId} after adding trader`);
          await supabaseAdmin
            .from("user_roles")
            .delete()
            .eq("user_id", targetUserId)
            .in("role", ["unverified", "verified"]);
        }
      }

      // If adding verified or trader role, also set membership information
      if (resp && !resp.error && (role === 'verified' || role === 'trader')) {
        console.log(`Setting membership for ${role} user ${targetUserId}`);
        
        const membershipYears = 1; // All memberships are now 1 year
        const now = new Date();
        const membershipExpiry = new Date(now.getTime() + (membershipYears * 365 * 24 * 60 * 60 * 1000));
        
        const membershipResp = await supabaseAdmin
          .from("profiles")
          .update({
            membership_expires_at: membershipExpiry.toISOString(),
            membership_status: 'active',
            last_payment_date: now.toISOString()
          })
          .eq('id', targetUserId);
          
        if (membershipResp.error) {
          console.error(`Failed to set membership for user ${targetUserId}:`, membershipResp.error);
        } else {
          console.log(`Successfully set ${membershipYears}-year membership for ${role} user ${targetUserId}`);
        }
      }
        
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

      // Handle role transitions when removing verification roles
      if (resp && !resp.error) {
        if (role === 'verified') {
          // When removing verified, add unverified role if user has no other verification roles
          const { data: hasTrader } = await supabaseAdmin
            .from("user_roles")
            .select("role")
            .eq("user_id", targetUserId)
            .eq("role", "trader");
          
          if (!hasTrader || hasTrader.length === 0) {
            console.log(`Adding unverified role for user ${targetUserId} after removing verified`);
            await supabaseAdmin
              .from("user_roles")
              .insert({ user_id: targetUserId, role: 'unverified' });
          }
        } else if (role === 'trader') {
          // When removing trader, check if user has verified role, otherwise add unverified
          const { data: hasVerified } = await supabaseAdmin
            .from("user_roles")
            .select("role")
            .eq("user_id", targetUserId)
            .eq("role", "verified");
          
          if (!hasVerified || hasVerified.length === 0) {
            console.log(`Adding unverified role for user ${targetUserId} after removing trader`);
            await supabaseAdmin
              .from("user_roles")
              .insert({ user_id: targetUserId, role: 'unverified' });
          }
        }
      }

      // If removing verified or trader role, handle membership status
      if (resp && !resp.error && (role === 'verified' || role === 'trader')) {
        console.log(`Handling membership removal for ${role} user ${targetUserId}`);
        
        // Check if user still has any verification roles
        const { data: remainingRoles } = await supabaseAdmin
          .from("user_roles")
          .select("role")
          .eq("user_id", targetUserId)
          .in("role", ["verified", "trader"]);
          
        if (!remainingRoles || remainingRoles.length === 0) {
          // User has no verification roles left, set membership to expired
          const membershipResp = await supabaseAdmin
            .from("profiles")
            .update({
              membership_status: 'expired'
            })
            .eq('id', targetUserId);
            
          if (membershipResp.error) {
            console.error(`Failed to expire membership for user ${targetUserId}:`, membershipResp.error);
          } else {
            console.log(`Expired membership for unverified user ${targetUserId}`);
          }
        } else {
          // User still has verification roles, update membership based on highest role
          const hasTrader = remainingRoles.some(r => r.role === 'trader');
          const membershipYears = 1; // All memberships are now 1 year
          const now = new Date();
          const membershipExpiry = new Date(now.getTime() + (membershipYears * 365 * 24 * 60 * 60 * 1000));
          
          const membershipResp = await supabaseAdmin
            .from("profiles")
            .update({
              membership_expires_at: membershipExpiry.toISOString(),
              membership_status: 'active',
              last_payment_date: now.toISOString()
            })
            .eq('id', targetUserId);
            
          if (membershipResp.error) {
            console.error(`Failed to update membership for user ${targetUserId}:`, membershipResp.error);
          } else {
            console.log(`Updated membership for user ${targetUserId} based on remaining roles`);
          }
        }
      }
    }

    if (resp && resp.error) {
      console.error(`${role} role management error:`, resp.error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: resp.error.message 
      }), { headers: corsHeaders, status: 400 });
    }

    // Add a reduced delay to allow database changes to propagate
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
