import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type VerificationLevel = "unverified" | "verified" | "trader";

export interface UserVerificationStatus {
  level: VerificationLevel;
  isAdmin: boolean;
  isVerified: boolean;
  isTrader: boolean;
  loading: boolean;
}

export function useUserVerification(): UserVerificationStatus {
  const { user } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<UserVerificationStatus>({
    level: "unverified",
    isAdmin: false,
    isVerified: false,
    isTrader: false,
    loading: true,
  });

  useEffect(() => {
    if (!user) {
      setVerificationStatus({
        level: "unverified",
        isAdmin: false,
        isVerified: false,
        isTrader: false,
        loading: false,
      });
      return;
    }

    const fetchVerificationStatus = async () => {
      try {
        // Get user verification level using the new database function
        const { data: levelData, error: levelError } = await supabase
          .rpc('get_user_verification_level', { _user_id: user.id });

        if (levelError) {
          console.error("Error fetching verification level:", levelError);
          return;
        }

        // Get detailed role information
        const { data: rolesData, error: rolesError } = await supabase
          .rpc('get_user_roles_batch', { user_ids: [user.id] });

        if (rolesError) {
          console.error("Error fetching user roles:", rolesError);
          return;
        }

        const userRoles = rolesData?.[0];
        const level = levelData as VerificationLevel;

        setVerificationStatus({
          level,
          isAdmin: userRoles?.is_admin || false,
          isVerified: userRoles?.is_verified || false,
          isTrader: userRoles?.is_trader || false,
          loading: false,
        });
      } catch (error) {
        console.error("Error in fetchVerificationStatus:", error);
        setVerificationStatus(prev => ({ ...prev, loading: false }));
      }
    };

    fetchVerificationStatus();
  }, [user]);

  return verificationStatus;
}