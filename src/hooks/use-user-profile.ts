import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User, UserProfile } from "@/types";
import { obfuscateText } from "@/utils/stringUtils";

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
      console.error("Error fetching profile:", err);
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

  const updateProfile = useCallback(async (updateData: Partial<UserProfile>) => {
    if (!authUser?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to update your profile.",
        variant: "destructive",
      });
      return { success: false };
    }

    // Can only update your own profile
    if (targetUserId !== authUser.id) {
      toast({
        title: "Permission Denied",
        description: "You can only update your own profile.",
        variant: "destructive",
      });
      return { success: false };
    }

    try {
      // Map UserProfile fields to database fields
      const dbUpdateData: Record<string, any> = {
        full_name: updateData.fullName,
        email: updateData.email,
        address_line1: updateData.addressLine1,
        address_line2: updateData.addressLine2,
        city: updateData.city,
        postcode: updateData.postcode,
        country: updateData.country,
        trading_address: updateData.tradingAddress,
        company_name: updateData.companyName,
        phone_number: updateData.phoneNumber,
        updated_at: new Date().toISOString(),
      };

      // Remove undefined values
      Object.keys(dbUpdateData).forEach(key => 
        dbUpdateData[key] === undefined && delete dbUpdateData[key]
      );

      const { error } = await supabase
        .from("profiles")
        .update(dbUpdateData)
        .eq("id", authUser.id);

      if (error) throw error;

      // Update local state with new data
      setProfile(prev => prev ? { ...prev, ...updateData } : null);

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });

      return { success: true };
    } catch (err) {
      console.error("Error updating profile:", err);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      return { success: false };
    }
  }, [authUser?.id, targetUserId]);

  const uploadAvatar = useCallback(async (file: File) => {
    if (!authUser?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload an avatar.",
        variant: "destructive",
      });
      return { success: false, url: null };
    }

    try {
      // Upload the file to the avatars bucket
      const fileName = `${authUser.id}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          upsert: true, // Overwrite if the file already exists
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData.publicUrl;

      // Update the profile with the new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq("id", authUser.id);

      if (updateError) throw updateError;

      // Update local state
      setProfile(prev => prev ? { ...prev, avatarUrl: publicUrl } : null);

      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated.",
      });

      return { success: true, url: publicUrl };
    } catch (err) {
      console.error("Error uploading avatar:", err);
      toast({
        title: "Error",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
      return { success: false, url: null };
    }
  }, [authUser?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    uploadAvatar,
    refetch: fetchProfile,
    isOwnProfile: authUser?.id === targetUserId,
  };
};

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
      // Fetch seller profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, created_at, feedback_rating")
        .eq("id", sellerId)
        .single();

      if (profileError) throw profileError;

      // Count number of active listings by this seller
      const { count: listingsCount, error: listingsError } = await supabase
        .from("listings")
        .select("id", { count: "exact" })
        .eq("seller_id", sellerId)
        .eq("status", "active");

      if (listingsError) throw listingsError;

      // Instead of showing real full name, show obfuscated username (for privacy, matches bid history)
      const safeObfuscated = obfuscateText(profileData.full_name || "", 2);

      setSeller({
        id: profileData.id,
        name: safeObfuscated || "Unknown Seller",
        avatarUrl: profileData.avatar_url,
        joinDate: new Date(profileData.created_at),
        rating: profileData.feedback_rating || 0,
        salesCount: listingsCount || 0,
        verified: true, // For now, assume all sellers are verified
        username: safeObfuscated,
      });
    } catch (err) {
      console.error("Error fetching seller profile:", err);
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
