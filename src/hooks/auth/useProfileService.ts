
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@/types";
import type { Tables } from "@/integrations/supabase/types";

// Helper function to check if the data is a valid profile
function isValidProfile(data: any): data is Tables<"profiles"> {
  return (
    data &&
    typeof data === 'object' &&
    'id' in data &&
    typeof data.id === 'string' &&
    'created_at' in data &&
    typeof data.created_at === 'string'
  );
}

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
          ].join(",")
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        setUser(null);
        return;
      }
      
      // Properly handle the case where data might be null
      if (!data) {
        console.error("No profile data found for user ID:", id);
        setUser(null);
        return;
      }
      
      // Use our custom type guard to validate the profile data
      if (isValidProfile(data)) {
        const profileUser: User = {
          id: data.id,
          name: data.full_name || "",
          email: data.email || "",
          role: "unverified", // default, role checking done elsewhere
          createdAt: new Date(data.created_at),
          purchases: 0,
          sales: 0,
          feedbackRating: data.feedback_rating ?? 0,
          isVerified: false,
          isTwoFactorEnabled: data.is_two_factor_enabled ?? false,
          annual2FAPaymentDate: data.annual_2fa_payment_date
            ? new Date(data.annual_2fa_payment_date)
            : undefined,
          referredBy: data.referred_by,
          // Also fetch any Supabase auth data for this user (for email verification status and last sign in)
          emailConfirmedAt: undefined, // We'll need to set this from auth data
          lastSignInAt: undefined,      // We'll need to set this from auth data
        };
        
        // Now fetch the auth.users data to get email_confirmed_at and last_sign_in_at
        const { data: authData, error: authError } = await supabase.auth.admin.getUserById(id);
        
        if (!authError && authData?.user) {
          profileUser.emailConfirmedAt = authData.user.email_confirmed_at 
            ? new Date(authData.user.email_confirmed_at) 
            : undefined;
          profileUser.lastSignInAt = authData.user.last_sign_in_at
            ? new Date(authData.user.last_sign_in_at)
            : undefined;
        }
        
        setUser(profileUser);
      } else {
        console.error("Invalid profile data structure:", data);
        setUser(null);
      }
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
      setUser(null);
    }
  }, [setUser]);

  return { fetchUserProfile };
};
