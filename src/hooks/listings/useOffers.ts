
import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Offer } from "@/types";

interface UseOffersOptions {
  listingId?: string;
  onOfferSuccess?: () => void;
}

export const useOffers = ({ listingId, onOfferSuccess }: UseOffersOptions = {}) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchOffers = useCallback(async () => {
    if (!listingId || !user) {
      setOffers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get listing to determine if user is seller
      const { data: listing } = await supabase
        .from("listings")
        .select("seller_id")
        .eq("id", listingId)
        .single();

      let query = supabase
        .from("offers")
        .select(`
          *,
          profiles(
            full_name,
            avatar_url
          )
        `)
        .eq("listing_id", listingId);

      // If user is not the seller, only show their own offers
      if (!listing || listing.seller_id !== user.id) {
        query = query.eq("user_id", user.id);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      // Convert database records to Offer type
      const mappedOffers: Offer[] = data.map(item => ({
        id: item.id,
        userId: item.user_id,
        listingId: item.listing_id,
        amount: Number(item.amount),
        message: item.message,
        status: item.status,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        user: item.profiles ? {
          fullName: item.profiles.full_name,
          avatarUrl: item.profiles.avatar_url,
        } : undefined
      }));

      setOffers(mappedOffers);
    } catch (err) {
      console.error("Error fetching offers:", err);
      setError("Failed to fetch offers. Please try again.");
      toast({
        title: "Error",
        description: "Failed to fetch offers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [listingId, user]);

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
      fetchOffers();
      
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
            title
          )
        `)
        .eq("id", offerId)
        .single();

      if (offerData) {
        // Create notification for the offerer
        await supabase
          .from("notifications")
          .insert({
            user_id: offerData.user_id,
            type: `offer_${status}`,
            message: `Your offer of £${Number(offerData.amount).toLocaleString()} for "${offerData.listings.title}" was ${status}.`,
            metadata: {
              listing_id: offerData.listing_id,
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
      fetchOffers();

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

  const getUserOfferStatus = useCallback(() => {
    if (!user || offers.length === 0) {
      return {
        hasPendingOffer: false,
        latestOffer: null
      };
    }

    const userOffers = offers.filter(offer => offer.userId === user.id);
    const hasPendingOffer = userOffers.some(offer => offer.status === 'pending');
    const latestOffer = userOffers.length > 0 ? userOffers[0] : null;

    return {
      hasPendingOffer,
      latestOffer
    };
  }, [user, offers]);

  return {
    offers,
    isLoading,
    error,
    makeOffer,
    fetchOffers,
    respondToOffer,
    getUserOfferStatus
  };
};
