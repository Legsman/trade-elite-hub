
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      setSeller({
        id: profileData.id,
        name: profileData.full_name || "Unknown Seller",
        avatarUrl: profileData.avatar_url,
        joinDate: new Date(profileData.created_at),
        rating: profileData.feedback_rating || 0,
        salesCount: listingsCount || 0,
        verified: true,
        username: profileData.username || null,
      });
    } catch (err) {
      setError("Failed to fetch seller information. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    fetchSellerProfile();
  }, [fetchSellerProfile]);

  return {
    seller,
    isLoading,
    error,
    refetch: fetchSellerProfile,
  };
};
