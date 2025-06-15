
import { useCallback } from "react";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types";
import { toast } from "@/hooks/use-toast";

export const useProfileUpdater = (targetUserId: string | undefined, setProfile: (cb: (prev: UserProfile | null) => UserProfile | null) => void) => {
  const { user: authUser } = useAuth();

  const updateProfile = useCallback(async (updateData: Partial<UserProfile>) => {
    if (!authUser?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to update your profile.",
        variant: "destructive",
      });
      return { success: false };
    }
    if (targetUserId !== authUser.id) {
      toast({
        title: "Permission Denied",
        description: "You can only update your own profile.",
        variant: "destructive",
      });
      return { success: false };
    }
    try {
      const dbUpdateData: Record<string, any> = {
        username: updateData.username,
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
      Object.keys(dbUpdateData).forEach(key => dbUpdateData[key] === undefined && delete dbUpdateData[key]);
      const { error } = await supabase
        .from("profiles")
        .update(dbUpdateData)
        .eq("id", authUser.id);

      if (error) throw error;
      setProfile(prev => (prev ? { ...prev, ...updateData } : null));
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      return { success: true };
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      return { success: false };
    }
  }, [authUser?.id, targetUserId, setProfile]);

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
      const fileName = `${authUser.id}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData.publicUrl;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq("id", authUser.id);

      if (updateError) throw updateError;
      setProfile(prev => (prev ? { ...prev, avatarUrl: publicUrl } : null));
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated.",
      });
      return { success: true, url: publicUrl };
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
      return { success: false, url: null };
    }
  }, [authUser?.id, setProfile]);

  return { updateProfile, uploadAvatar };
};
