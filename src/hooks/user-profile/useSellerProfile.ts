
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFeedback } from "@/hooks/feedback";

export const useSellerProfile = (sellerId?: string) => {
  const [seller, setSeller] = useState<{ 
    id: string; 
    name: string; 
    avatarUrl?: string;
    joinDate: Date;
    rating: number;
    salesCount: number;
    verified: boolean;
    username?: string | null;
    feedbackCount: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch seller's feedback data (as seller)
  const { data: sellerFeedback, isLoading: sellerFeedbackLoading } = useFeedback({
    userId: sellerId,
    as: "seller",
    listingId: null
  });

  // Fetch buyer's feedback data (as buyer)
  const { data: buyerFeedback, isLoading: buyerFeedbackLoading } = useFeedback({
    userId: sellerId,
    as: "buyer",
    listingId: null
  });

  const fetchSellerProfile = useCallback(async () => {
    if (!sellerId) {
      setSeller(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, created_at, feedback_rating")
        .eq("id", sellerId)
        .single();

      if (profileError) throw profileError;

      const { count: listingsCount, error: listingsError } = await supabase
        .from("listings")
        .select("id", { count: "exact" })
        .eq("seller_id", sellerId)
        .eq("status", "active");

      if (listingsError) throw listingsError;

      // Calculate combined feedback statistics (seller + buyer)
      const combinedFeedback = [...(sellerFeedback || []), ...(buyerFeedback || [])];
      const feedbackCount = combinedFeedback.length;
      const realRating = feedbackCount > 0 
        ? combinedFeedback.reduce((sum, fb) => sum + fb.rating, 0) / feedbackCount
        : 0;

      setSeller({
        id: profileData.id,
        name: profileData.full_name || "Unknown Seller",
        avatarUrl: profileData.avatar_url,
        joinDate: new Date(profileData.created_at),
        rating: realRating,
        salesCount: listingsCount || 0,
        verified: true,
        username: profileData.username || null,
        feedbackCount,
      });
    } catch (err) {
      setError("Failed to fetch seller information. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [sellerId, sellerFeedback, buyerFeedback]);

  useEffect(() => {
    fetchSellerProfile();
  }, [fetchSellerProfile]);

  return {
    seller,
    isLoading: isLoading || sellerFeedbackLoading || buyerFeedbackLoading,
    error,
    refetch: fetchSellerProfile,
    feedback: sellerFeedback,
    combinedFeedback: [...(sellerFeedback || []), ...(buyerFeedback || [])],
  };
};
