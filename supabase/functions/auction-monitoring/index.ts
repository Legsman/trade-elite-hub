import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    console.log('Starting auction monitoring process...');

    // 1. Check for expired auctions and update their status
    const { data: expiredAuctions, error: expiredError } = await supabaseClient
      .from('listings')
      .select('id, title, seller_id, expires_at, highest_bidder_id, current_bid')
      .eq('type', 'auction')
      .eq('status', 'active')
      .lt('expires_at', new Date().toISOString())

    if (expiredError) {
      console.error('Error fetching expired auctions:', expiredError);
      throw expiredError;
    }

    console.log(`Found ${expiredAuctions?.length || 0} expired auctions to process`);

    // Update expired auctions and notify users
    for (const auction of expiredAuctions || []) {
      console.log(`Processing expired auction: ${auction.id}`);

      // Update auction status to expired
      const { error: updateError } = await supabaseClient
        .from('listings')
        .update({ 
          status: 'expired',
          updated_at: new Date().toISOString()
        })
        .eq('id', auction.id);

      if (updateError) {
        console.error(`Error updating auction ${auction.id}:`, updateError);
        continue;
      }

      // If there's a winning bidder, mark as sold and notify
      if (auction.highest_bidder_id && auction.current_bid) {
        console.log(`Auction ${auction.id} has a winner: ${auction.highest_bidder_id}`);

        // Update to sold status
        const { error: soldError } = await supabaseClient
          .from('listings')
          .update({
            status: 'sold',
            sale_buyer_id: auction.highest_bidder_id,
            sale_amount: auction.current_bid,
            sale_date: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', auction.id);

        if (soldError) {
          console.error(`Error marking auction ${auction.id} as sold:`, soldError);
          continue;
        }

        // Notify the winner
        const { error: winnerNotificationError } = await supabaseClient
          .from('notifications')
          .insert({
            user_id: auction.highest_bidder_id,
            type: 'auction_won',
            message: `Congratulations! You won the auction for "${auction.title}"`,
            metadata: {
              listing_id: auction.id,
              listing_title: auction.title,
              winning_amount: auction.current_bid
            }
          });

        if (winnerNotificationError) {
          console.error(`Error creating winner notification:`, winnerNotificationError);
        }

        // Notify the seller
        const { error: sellerNotificationError } = await supabaseClient
          .from('notifications')
          .insert({
            user_id: auction.seller_id,
            type: 'auction_sold',
            message: `Your auction "${auction.title}" has ended and sold for £${auction.current_bid}`,
            metadata: {
              listing_id: auction.id,
              listing_title: auction.title,
              sale_amount: auction.current_bid
            }
          });

        if (sellerNotificationError) {
          console.error(`Error creating seller notification:`, sellerNotificationError);
        }

      } else {
        console.log(`Auction ${auction.id} ended without bids`);

        // Notify seller that auction ended without bids
        const { error: noWinnerNotificationError } = await supabaseClient
          .from('notifications')
          .insert({
            user_id: auction.seller_id,
            type: 'auction_ended_no_bids',
            message: `Your auction "${auction.title}" has ended without any bids`,
            metadata: {
              listing_id: auction.id,
              listing_title: auction.title
            }
          });

        if (noWinnerNotificationError) {
          console.error(`Error creating no-winner notification:`, noWinnerNotificationError);
        }
      }
    }

    // 2. Get monitoring data for failed bid attempts in the last 24 hours
    const { data: failedBids, error: failedBidsError } = await supabaseClient
      .from('bid_attempt_logs')
      .select('*')
      .gte('attempted_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('attempted_at', { ascending: false });

    if (failedBidsError) {
      console.error('Error fetching failed bid attempts:', failedBidsError);
    }

    console.log(`Found ${failedBids?.length || 0} failed bid attempts in the last 24 hours`);

    // 3. Clean up old bid attempt logs (older than 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { error: cleanupError } = await supabaseClient
      .from('bid_attempt_logs')
      .delete()
      .lt('attempted_at', thirtyDaysAgo);

    if (cleanupError) {
      console.error('Error cleaning up old bid attempt logs:', cleanupError);
    }

    const response = {
      success: true,
      processedAuctions: expiredAuctions?.length || 0,
      failedBidAttempts: failedBids?.length || 0,
      timestamp: new Date().toISOString()
    };

    console.log('Auction monitoring completed:', response);

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in auction monitoring:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})