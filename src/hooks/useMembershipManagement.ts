import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface MembershipInfo {
  membership_expires_at: string | null;
  membership_status: string | null;
  last_payment_date: string | null;
  grace_period_until: string | null;
}

export const useMembershipManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user's membership info
  const { data: membershipInfo, isLoading } = useQuery({
    queryKey: ["membership-info"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .select("membership_expires_at, membership_status, last_payment_date, grace_period_until")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data as MembershipInfo;
    },
  });

  // Update membership expiry (for admin use)
  const updateMembershipExpiry = useMutation({
    mutationFn: async ({ userId, expiryDate }: { userId: string; expiryDate: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          membership_expires_at: expiryDate,
          membership_status: "active",
          last_payment_date: new Date().toISOString()
        })
        .eq("id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Membership expiry updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["membership-info"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Manually trigger membership check (for admin)
  const triggerMembershipCheck = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.functions.invoke("check-membership-expiry");
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Membership check triggered successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Check if membership is expiring soon
  const getMembershipStatus = () => {
    if (!membershipInfo?.membership_expires_at) {
      return { status: "unknown", daysUntilExpiry: null, isExpiring: false };
    }

    const expiryDate = new Date(membershipInfo.membership_expires_at);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const isExpired = daysUntilExpiry < 0;
    const isExpiring = daysUntilExpiry <= 7 && daysUntilExpiry > 0;

    return {
      status: isExpired ? "expired" : isExpiring ? "expiring" : "active",
      daysUntilExpiry,
      isExpiring: isExpiring || isExpired,
      membershipStatus: membershipInfo.membership_status
    };
  };

  return {
    membershipInfo,
    isLoading,
    updateMembershipExpiry,
    triggerMembershipCheck,
    getMembershipStatus,
  };
};