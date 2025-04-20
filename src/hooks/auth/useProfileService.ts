
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@/types";
import type { Tables } from "@/integrations/supabase/types";

export const useProfileService = (setUser: (user: User | null) => void) => {
  const fetchUserProfile = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          [
            "id",
            "full_name",
            "avatar_url",
            "address_line1",
            "address_line2",
            "city",
            "postcode",
            "country",
            "trading_address",
            "company_name",
            "phone_number",
            "email",
            "signup_date",
            "strike_count",
            "is_two_factor_enabled",
            "referred_by",
            "feedback_rating",
            "annual_2fa_payment_date",
            "created_at",
            "updated_at",
          ]
            .map((f) => f)
            .join(",")
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }
      
      if (data !== null) {
        const hasValidShape = typeof data === 'object' && data !== null && 'id' in data;
        
        if (hasValidShape) {
          const profile = data as Tables<"profiles">;
          
          const profileUser: User = {
            id: profile.id,
            name: profile.full_name || "",
            email: profile.email || "",
            role: "unverified", // default, role checking done elsewhere
            createdAt: new Date(profile.created_at),
            purchases: 0,
            sales: 0,
            feedbackRating: profile.feedback_rating ?? 0,
            isVerified: false,
            isTwoFactorEnabled: profile.is_two_factor_enabled ?? false,
            annual2FAPaymentDate: profile.annual_2fa_payment_date
              ? new Date(profile.annual_2fa_payment_date)
              : undefined,
            referredBy: profile.referred_by,
          };
          setUser(profileUser);
        } else {
          console.error("Profile data is not in the expected format:", data);
        }
      }
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
    }
  }, [setUser]);

  return { fetchUserProfile };
};
