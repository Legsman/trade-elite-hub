
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth";

interface RelistingData {
  reason: string;
  additionalInfo?: string;
}

export const useRelistListing = (listingId?: string) => {
  const [isRelisting, setIsRelisting] = useState(false);
  const { user } = useAuth();

  const relistListing = async (data: RelistingData) => {
    if (!user || !listingId) {
      toast({
        title: "Error",
        description: "User or listing information missing",
        variant: "destructive",
      });
      return { success: false };
    }

    setIsRelisting(true);

    try {
      // 1. Get current listing information
      const { data: listing, error: listingError } = await supabase
        .from("listings")
        .select("*")
        .eq("id", listingId)
        .single();

      if (listingError) throw listingError;

      // 2. Verify the current user is the seller
      if (listing.seller_id !== user.id) {
        throw new Error("Only the seller can relist this item");
      }

      // 3. Mark original listing as 'relisted' and record the reason
      const { error: originalUpdateError } = await supabase
        .from("listings")
        .update({
          status: "relisted",
          relist_reason: data.reason,
          relisted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", listingId);

      if (originalUpdateError) throw originalUpdateError;

      // 4. Cancel all bids on the original listing
      const { error: bidCancelError } = await supabase
        .from("bids")
        .update({ 
          status: "cancelled_due_to_relist",
          updated_at: new Date().toISOString()
        })
        .eq("listing_id", listingId)
        .eq("status", "active");

      if (bidCancelError) throw bidCancelError;

      // 5. Cancel all offers on the original listing
      const { error: offerCancelError } = await supabase
        .from("offers")
        .update({ 
          status: "cancelled",
          updated_at: new Date().toISOString() 
        })
        .eq("listing_id", listingId)
        .in("status", ["pending", "accepted"]);

      if (offerCancelError) throw offerCancelError;

      // 6. Create a completely new listing with fresh data
      const newExpirationDate = new Date();
      newExpirationDate.setDate(newExpirationDate.getDate() + 7); // 7 days from now

      const { data: newListing, error: createError } = await supabase
        .from("listings")
        .insert({
          seller_id: listing.seller_id,
          title: listing.title,
          description: listing.description,
          category: listing.category,
          type: listing.type,
          price: listing.price,
          location: listing.location,
          condition: listing.condition,
          images: listing.images,
          allow_best_offer: listing.allow_best_offer,
          bid_increment: listing.bid_increment,
          expires_at: newExpirationDate.toISOString(),
          status: "active",
          views: 0,
          saves: 0,
          original_listing_id: listingId,
          // relist_count will be auto-calculated by trigger
        })
        .select()
        .single();

      if (createError) throw createError;

      // 7. Notify previous bidders about the relist
      const { data: previousBidders } = await supabase
        .from("bids")
        .select("user_id")
        .eq("listing_id", listingId)
        .eq("status", "cancelled_due_to_relist");

      if (previousBidders?.length) {
        const notifications = previousBidders.map(bid => ({
          user_id: bid.user_id,
          type: "listing_relisted",
          message: `The auction "${listing.title}" you bid on has been relisted as a new auction. You can view the new listing and place new bids.`,
          metadata: {
            original_listing_id: listingId,
            new_listing_id: newListing.id,
            reason: data.reason,
            additional_info: data.additionalInfo || null,
          }
        }));

        await supabase.from("notifications").insert(notifications);
      }

      toast({
        title: "Listing Relisted Successfully",
        description: "A new listing has been created. Previous bids and offers have been cancelled.",
      });

      return { success: true, newListingId: newListing.id };
    } catch (error) {
      console.error("Error relisting item:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was an error relisting the item",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setIsRelisting(false);
    }
  };

  return {
    isRelisting,
    relistListing
  };
};
