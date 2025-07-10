
import { useCallback } from "react";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useBrowserNotifications } from "@/hooks/useBrowserNotifications";

export const useOfferActions = (
  listingId?: string,
  onOfferSuccess?: () => void,
  fetchOffers?: () => Promise<void>
) => {
  const { user } = useAuth();
  const { showNotification } = useBrowserNotifications();

  const makeOffer = useCallback(async (amount: number, message?: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make an offer.",
        variant: "destructive",
      });
      return { success: false };
    }

    if (!listingId) {
      toast({
        title: "Error",
        description: "Listing not found.",
        variant: "destructive",
      });
      return { success: false };
    }

    try {
      // Check if user already has a pending offer
      const { data: existingOffers } = await supabase
        .from("offers")
        .select("id, status")
        .eq("user_id", user.id)
        .eq("listing_id", listingId)
        .eq("status", "pending");

      if (existingOffers && existingOffers.length > 0) {
        toast({
          title: "Offer Already Exists",
          description: "You already have a pending offer on this listing.",
          variant: "destructive",
        });
        return { success: false };
      }

      // Insert new offer
      const { error: insertError } = await supabase
        .from("offers")
        .insert({
          user_id: user.id,
          listing_id: listingId,
          amount,
          message,
          status: "pending"
        });

      if (insertError) throw insertError;

      // Create notification for the listing owner
      const { data: listingData } = await supabase
        .from("listings")
        .select("seller_id, title")
        .eq("id", listingId)
        .single();

      if (listingData) {
        await supabase
          .from("notifications")
          .insert({
            user_id: listingData.seller_id,
            type: "new_offer",
            message: `New offer of £${amount.toLocaleString()} on your listing "${listingData.title}"`,
            metadata: {
              listing_id: listingId,
              listing_title: listingData.title,
              offer_amount: amount,
              offerer_id: user.id
            }
          });
      }

      toast({
        title: "Offer Submitted",
        description: `Your offer of £${amount.toLocaleString()} has been sent to the seller.`,
      });

      // Refresh offers
      if (fetchOffers) {
        fetchOffers();
      }
      
      // Call success callback if provided
      if (onOfferSuccess) {
        onOfferSuccess();
      }

      return { success: true };
    } catch (err) {
      console.error("Error making offer:", err);
      toast({
        title: "Error",
        description: "Failed to submit offer. Please try again.",
        variant: "destructive",
      });
      return { success: false };
    }
  }, [user, listingId, fetchOffers, onOfferSuccess]);

  const respondToOffer = useCallback(async (offerId: string, status: 'accepted' | 'declined') => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to respond to offers.",
        variant: "destructive",
      });
      return { success: false };
    }

    try {
      // Update offer status
      const { error: updateError } = await supabase
        .from("offers")
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq("id", offerId);

      if (updateError) throw updateError;

      // Get the offer details to create notification
      const { data: offerData } = await supabase
        .from("offers")
        .select(`
          amount, 
          user_id,
          listing_id,
          listings (
            title,
            id
          )
        `)
        .eq("id", offerId)
        .single();

      if (offerData) {
        // If the offer is accepted, mark the listing as sold
        if (status === 'accepted') {
          // Update the listing status to sold
          const { error: listingUpdateError } = await supabase
            .from("listings")
            .update({ 
              status: "sold",
              updated_at: new Date().toISOString()
            })
            .eq("id", offerData.listing_id);
          
          if (listingUpdateError) throw listingUpdateError;
          
          // Decline all other pending offers for this listing
          const { error: declineOtherOffersError } = await supabase
            .from("offers")
            .update({ 
              status: "declined",
              updated_at: new Date().toISOString()
            })
            .eq("listing_id", offerData.listing_id)
            .eq("status", "pending")
            .neq("id", offerId);
          
          if (declineOtherOffersError) throw declineOtherOffersError;
          
          // Notify other users that their offers were declined because another offer was accepted
          const { data: otherOffers } = await supabase
            .from("offers")
            .select("user_id")
            .eq("listing_id", offerData.listing_id)
            .neq("id", offerId)
            .neq("user_id", offerData.user_id);
          
          if (otherOffers && otherOffers.length > 0) {
            const notifications = otherOffers.map(offer => ({
              user_id: offer.user_id,
              type: "offer_auto_declined",
              message: `Your offer on "${offerData.listings.title}" was declined because another offer was accepted.`,
              metadata: {
                listing_id: offerData.listing_id,
                listing_title: offerData.listings.title,
                status: "declined",
                reason: "another_offer_accepted"
              }
            }));
            
            await supabase
              .from("notifications")
              .insert(notifications);
          }
        }

        // Create notification for the offerer
        await supabase
          .from("notifications")
          .insert({
            user_id: offerData.user_id,
            type: `offer_${status}`,
            message: `Your offer of £${Number(offerData.amount).toLocaleString()} for "${offerData.listings.title}" was ${status}.`,
            metadata: {
              listing_id: offerData.listing_id,
              listing_title: offerData.listings.title,
              offer_id: offerId,
              offer_amount: offerData.amount,
              status
            }
          });
      }

      toast({
        title: `Offer ${status === 'accepted' ? 'Accepted' : 'Declined'}`,
        description: `You have ${status} the offer.`,
      });

      // Refresh offers
      if (fetchOffers) {
        fetchOffers();
      }

      return { success: true };
    } catch (err) {
      console.error(`Error ${status} offer:`, err);
      toast({
        title: "Error",
        description: `Failed to ${status} offer. Please try again.`,
        variant: "destructive",
      });
      return { success: false };
    }
  }, [user, fetchOffers]);

  return { makeOffer, respondToOffer };
};
