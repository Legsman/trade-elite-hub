
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { UserProfile } from "@/types";

export const useUserProfile = (userId?: string) => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetUserId = userId || authUser?.id;

  const fetchProfile = useCallback(async () => {
    if (!targetUserId) {
      setProfile(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", targetUserId)
        .single();

      if (error) throw error;
      setProfile({
        id: data.id,
        username: data.username,
        fullName: data.full_name || "",
        email: data.email || "",
        avatarUrl: data.avatar_url,
        addressLine1: data.address_line1 || "",
        addressLine2: data.address_line2 || "",
        city: data.city || "",
        postcode: data.postcode || "",
        country: data.country || "",
        tradingAddress: data.trading_address || "",
        companyName: data.company_name || "",
        phoneNumber: data.phone_number || "",
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        subscriptionStatus: data.subscription_status,
        subscriptionTier: data.subscription_tier,
        subscriptionEndDate: data.subscription_end_date ? new Date(data.subscription_end_date) : undefined,
        paymentMethods: data.payment_methods,
        isTwoFactorEnabled: data.is_two_factor_enabled,
        strikeCount: data.strike_count
      });
    } catch (err) {
      setError("Failed to fetch profile. Please try again.");
      toast({
        title: "Error",
        description: "Failed to fetch profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
    isOwnProfile: authUser?.id === targetUserId,
    setProfile, // Expose for updaters
  };
};
