
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";
import { toast } from "@/hooks/use-toast";

export interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  isLoading: boolean;
  isError: boolean;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    isLoading: false,
    isError: false,
  });

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setSubscriptionStatus(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setSubscriptionStatus(prev => ({ ...prev, isLoading: true, isError: false }));
      
      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) {
        console.error("Error checking subscription:", error);
        setSubscriptionStatus(prev => ({ ...prev, isLoading: false, isError: true }));
        toast({
          title: "Subscription Check Failed",
          description: "There was an error checking your subscription status. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      setSubscriptionStatus({
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier || null,
        subscription_end: data.subscription_end || null,
        isLoading: false,
        isError: false,
      });
    } catch (err) {
      console.error("Unexpected error checking subscription:", err);
      setSubscriptionStatus(prev => ({ ...prev, isLoading: false, isError: true }));
      toast({
        title: "Subscription Check Failed",
        description: "There was an unexpected error checking your subscription status.",
        variant: "destructive",
      });
    }
  }, [user]);

  // Initialize subscription status
  useEffect(() => {
    if (user) {
      checkSubscription();
    } else {
      setSubscriptionStatus({
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        isLoading: false,
        isError: false,
      });
    }
  }, [user, checkSubscription]);

  const createCheckoutSession = useCallback(async (options?: { 
    mode?: "subscription" | "payment", 
    priceId?: string,
    successUrl?: string,
    cancelUrl?: string 
  }) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe.",
        variant: "destructive",
      });
      return { url: null };
    }

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          mode: options?.mode || "subscription",
          priceId: options?.priceId,
          successUrl: options?.successUrl,
          cancelUrl: options?.cancelUrl,
        },
      });

      if (error) {
        console.error("Error creating checkout session:", error);
        toast({
          title: "Checkout Failed",
          description: "There was an error creating your checkout session. Please try again.",
          variant: "destructive",
        });
        return { url: null };
      }

      return { url: data.url };
    } catch (err) {
      console.error("Unexpected error creating checkout:", err);
      toast({
        title: "Checkout Failed",
        description: "There was an unexpected error creating your checkout session.",
        variant: "destructive",
      });
      return { url: null };
    }
  }, [user]);

  const createCustomerPortalSession = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to manage your subscription.",
        variant: "destructive",
      });
      return { url: null };
    }

    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");

      if (error) {
        console.error("Error creating customer portal session:", error);
        toast({
          title: "Portal Access Failed",
          description: "There was an error accessing the customer portal. Please try again.",
          variant: "destructive",
        });
        return { url: null };
      }

      return { url: data.url };
    } catch (err) {
      console.error("Unexpected error creating portal session:", err);
      toast({
        title: "Portal Access Failed",
        description: "There was an unexpected error accessing the customer portal.",
        variant: "destructive",
      });
      return { url: null };
    }
  }, [user]);

  return {
    ...subscriptionStatus,
    checkSubscription,
    createCheckoutSession,
    createCustomerPortalSession,
  };
};
