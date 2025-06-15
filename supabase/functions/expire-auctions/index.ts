
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Find all auctions that have expired but not processed, process results, and send notifications
async function processExpiredAuctions() {
  const nowISO = new Date().toISOString();

  // 1. Find auctions which are active and expired (not sold or manually ended)
  const { data: expiredListings, error: expErr } = await supabase
    .from("listings")
    .select("id, seller_id, title, price, current_bid, highest_bidder_id, expires_at, type, status")
    .eq("type", "auction")
    .eq("status", "active")
    .lte("expires_at", nowISO);

  if (expErr) {
    console.error("Error fetching expired auctions", expErr);
    return { processed: 0, error: expErr.message };
  }

  let actions = 0;

  for (const listing of expiredListings ?? []) {
    // Fetch all active bids for this listing, sorted by maximum_bid desc
    const { data: bids, error: bidErr } = await supabase
      .from("bids")
      .select("id, user_id, amount, maximum_bid, status, created_at")
      .eq("listing_id", listing.id)
      .eq("status", "active")
      .order("maximum_bid", { ascending: false })
      .order("created_at", { ascending: true });

    if (bidErr) {
      console.error("Error fetching bids for listing", listing.id, bidErr);
      continue;
    }

    if (!bids || bids.length === 0) {
      // No bids: expire listing
      const { error: updErr } = await supabase
        .from("listings")
        .update({ status: "expired" })
        .eq("id", listing.id);

      if (updErr) {
        console.error("Failed to set listing as expired", listing.id, updErr);
      } else {
        actions++;
        // Optionally, notify the seller that auction ended with no bids
        await supabase.from("notifications").insert({
          user_id: listing.seller_id,
          type: "auction_ended_no_bids",
          message: `Auction ended for "${listing.title}" with no bids.`,
          is_read: false
        });
      }
      continue;
    }

    // There is at least one bid, so the first one is the winner
    const winningBid = bids[0];

    // Mark winning bid as 'won' and update other bids as 'lost'
    const allIds = bids.map(b => b.id);
    const losingIds = allIds.filter(id => id !== winningBid.id);

    await supabase
      .from("bids")
      .update({ status: "won" })
      .eq("id", winningBid.id);

    if (losingIds.length > 0) {
      await supabase
        .from("bids")
        .update({ status: "lost" })
        .in("id", losingIds);
    }

    // Update the listing as sold
    await supabase
      .from("listings")
      .update({
        status: "sold",
        sale_buyer_id: winningBid.user_id,
        sale_amount: winningBid.amount,
        sale_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", listing.id);

    // Notification: Seller
    await supabase.from("notifications").insert({
      user_id: listing.seller_id,
      type: "auction_sold",
      message: `Your auction "${listing.title}" was won for £${Number(winningBid.amount).toLocaleString()}.`,
      metadata: {
        listingId: listing.id,
        buyerId: winningBid.user_id,
        amount: winningBid.amount
      },
      is_read: false
    });

    // Notification: Winner
    await supabase.from("notifications").insert({
      user_id: winningBid.user_id,
      type: "auction_won",
      message: `Congratulations! You won "${listing.title}" for £${Number(winningBid.amount).toLocaleString()}.`,
      metadata: {
        listingId: listing.id,
        sellerId: listing.seller_id,
        amount: winningBid.amount
      },
      is_read: false
    });

    // Feedback: Optionally insert a feedback "todo" marker (can be handled in UI fetches)

    actions++;
  }

  return { processed: actions, error: null };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const result = await processExpiredAuctions();

    return new Response(
      JSON.stringify({ ok: true, ...result }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Auction expiry job failed", error);
    return new Response(
      JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
