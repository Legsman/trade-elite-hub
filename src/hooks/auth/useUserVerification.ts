import { useState, useEffect, useCallback, useRef } from "react";
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
  
  const fetchInProgressRef = useRef(false);
  const cacheRef = useRef<{ userId: string; data: UserVerificationStatus } | null>(null);

  const fetchVerificationStatus = useCallback(async () => {
    if (!user?.id || fetchInProgressRef.current) return;
    
    // Check cache first
    if (cacheRef.current?.userId === user.id) {
      setVerificationStatus(cacheRef.current.data);
      return;
    }
    
    fetchInProgressRef.current = true;
    setVerificationStatus(prev => ({ ...prev, loading: true }));
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

      const newStatus = {
        level,
        isAdmin: userRoles?.is_admin || false,
        isVerified: userRoles?.is_verified || false,
        isTrader: userRoles?.is_trader || false,
        loading: false,
      };
      
      // Cache the result
      cacheRef.current = { userId: user.id, data: newStatus };
      setVerificationStatus(newStatus);
    } catch (error) {
      console.error("Error in fetchVerificationStatus:", error);
      setVerificationStatus(prev => ({ ...prev, loading: false }));
    } finally {
      fetchInProgressRef.current = false;
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user) {
      const noUserStatus = {
        level: "unverified" as VerificationLevel,
        isAdmin: false,
        isVerified: false,
        isTrader: false,
        loading: false,
      };
      setVerificationStatus(noUserStatus);
      cacheRef.current = null;
      return;
    }

    fetchVerificationStatus();
  }, [user?.id, fetchVerificationStatus]);

  return verificationStatus;
}