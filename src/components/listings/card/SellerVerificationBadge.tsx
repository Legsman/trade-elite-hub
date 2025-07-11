import { useState, useEffect } from "react";
import { VerificationBadge } from "@/components/auth/VerificationBadge";
import { VerificationLevel } from "@/hooks/auth/useUserVerification";
import { supabase } from "@/integrations/supabase/client";

interface SellerVerificationBadgeProps {
  sellerId: string;
  className?: string;
}

export const SellerVerificationBadge = ({ sellerId, className }: SellerVerificationBadgeProps) => {
  const [verificationLevel, setVerificationLevel] = useState<VerificationLevel>("unverified");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVerificationLevel = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_user_verification_level', { _user_id: sellerId });

        if (!error && data) {
          setVerificationLevel(data as VerificationLevel);
        }
      } catch (error) {
        console.error("Error fetching seller verification level:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVerificationLevel();
  }, [sellerId]);

  if (loading) {
    return null;
  }

  return (
    <div className={className}>
      <VerificationBadge 
        level={verificationLevel} 
        size="sm" 
        showText={false}
      />
    </div>
  );
};