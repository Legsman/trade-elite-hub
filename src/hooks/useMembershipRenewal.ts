import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMembershipManagement } from './useMembershipManagement';

export const useMembershipRenewal = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { getMembershipStatus, membershipInfo } = useMembershipManagement();

  const initiateMembershipRenewal = async (tier: 'verified' | 'trader') => {
    setLoading(true);
    try {
      const membershipFeeMap = {
        verified: 150, // £150 for verified
        trader: 300,   // £300 for trader
      };

      const { data, error } = await supabase.functions.invoke('process-membership-renewal', {
        body: {
          membership_fee: membershipFeeMap[tier],
          tier_type: tier,
        },
      });

      if (error) throw error;

      // Open Stripe checkout in new tab
      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Payment Session Created",
          description: "Redirecting to payment page...",
        });
      }

      return data;
    } catch (error) {
      console.error('Error initiating membership renewal:', error);
      toast({
        title: "Renewal Error",
        description: "Failed to initiate membership renewal",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const processRenewalPayment = async (sessionId: string) => {
    try {
      // Verify payment status
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { session_id: sessionId },
      });

      if (error) throw error;

      if (data.status === 'paid') {
        // Update membership expiry
        const newExpiryDate = new Date();
        newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              membership_expires_at: newExpiryDate.toISOString(),
              membership_status: 'active',
              last_payment_date: new Date().toISOString(),
            })
            .eq('id', user.id);

          if (updateError) throw updateError;

          toast({
            title: "Membership Renewed",
            description: "Your membership has been successfully renewed for one year",
          });

          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error processing renewal payment:', error);
      toast({
        title: "Payment Processing Error",
        description: "Failed to process renewal payment",
        variant: "destructive",
      });
      return false;
    }
  };

  const checkMembershipNeedsRenewal = () => {
    const status = getMembershipStatus();
    return status.isExpiring || status.status === 'expired';
  };

  const getDaysUntilExpiry = () => {
    const status = getMembershipStatus();
    return status.daysUntilExpiry;
  };

  return {
    loading,
    initiateMembershipRenewal,
    processRenewalPayment,
    checkMembershipNeedsRenewal,
    getDaysUntilExpiry,
    membershipInfo,
  };
};