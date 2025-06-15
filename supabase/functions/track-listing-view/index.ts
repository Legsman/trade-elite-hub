
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { listingId } = await req.json();
    if (!listingId) {
      return new Response(JSON.stringify({ error: "Listing ID required" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Setup Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Parse JWT for user_id if exists
    let user_id: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const jwt = authHeader.replace("Bearer ", "");
      try {
        const payload = JSON.parse(atob(jwt.split(".")[1]));
        user_id = payload.sub ?? null;
      } catch (_) {
        // Ignore decode error, treated as anon
      }
    }

    // Grab IP address and user agent where possible
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      null;
    const userAgent = req.headers.get("user-agent") || null;

    // Deduplication window (1hr)
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Check if this user (or ip) viewed in the past hour
    let filter = supabase
      .from("listing_views")
      .select("*", { count: "exact", head: true })
      .eq("listing_id", listingId)
      .gte("viewed_at", oneHourAgo.toISOString());

    if (user_id) {
      filter = filter.eq("user_id", user_id);
    } else if (ip) {
      filter = filter.eq("ip_address", ip);
    }

    const { count: recentViews, error: selectError } = await filter;
    if (selectError) throw selectError;

    if (recentViews && recentViews > 0) {
      // Already counted recently, just return current counter
      const { data: listing } = await supabase
        .from("listings")
        .select("views")
        .eq("id", listingId)
        .maybeSingle();
      return new Response(JSON.stringify({ counted: false, views: listing?.views ?? 0 }), { headers: corsHeaders });
    }

    // Insert the view
    const { error: insertError } = await supabase.from("listing_views").insert({
      listing_id: listingId,
      user_id: user_id,
      ip_address: ip,
      user_agent: userAgent,
      viewed_at: now.toISOString(),
    });
    if (insertError) throw insertError;

    // Atomically update the view count
    const { data: updated, error: updateError } = await supabase.rpc("increment_views", { l_id: listingId });
    if (updateError) {
      // fallback: increment manually
      await supabase
        .from("listings")
        .update({ views: supabase.literal("views + 1") })
        .eq("id", listingId);
    }

    // Return new count
    const { data: listing } = await supabase
      .from("listings")
      .select("views")
      .eq("id", listingId)
      .maybeSingle();

    return new Response(
      JSON.stringify({ counted: true, views: listing?.views ?? 0 }),
      { headers: corsHeaders }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Unexpected Error", detail: (err as Error).message ?? err }),
      { status: 500, headers: corsHeaders }
    );
  }
});
