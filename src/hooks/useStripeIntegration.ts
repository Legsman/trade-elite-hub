import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFeeCalculation, PaymentPrepData } from './useFeeCalculation';
import { usePaymentTracking } from './usePaymentTracking';

export interface StripeSessionData {
  sessionId: string;
  checkoutUrl: string;
  paymentIntentId?: string;
}

export const useStripeIntegration = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { preparePaymentData } = useFeeCalculation();
  const { createPaymentRecord } = usePaymentTracking();

  const createCheckoutSession = async (
    paymentData: PaymentPrepData,
    successUrl: string,
    cancelUrl: string
  ): Promise<StripeSessionData | null> => {
    setLoading(true);
    try {
      // First create a payment record in our database
      const orderId = await createPaymentRecord({
        amount: paymentData.amount,
        currency: paymentData.currency,
        fee_type: paymentData.feeType,
        tier_type: paymentData.tierType,
        metadata: paymentData.metadata,
      });

      if (!orderId) {
        throw new Error('Failed to create payment record');
      }

      // Prepare data for Stripe checkout edge function
      const checkoutData = {
        amount: paymentData.amount,
        currency: paymentData.currency,
        description: paymentData.description,
        metadata: {
          ...paymentData.metadata,
          order_id: orderId,
          fee_type: paymentData.feeType,
          tier_type: paymentData.tierType,
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      };

      // Call Stripe checkout edge function (when implemented)
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: checkoutData,
      });

      if (error) throw error;

      return {
        sessionId: data.session_id,
        checkoutUrl: data.url,
        paymentIntentId: data.payment_intent_id,
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Payment Error",
        description: "Failed to create payment session. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createMembershipPayment = async (
    userId: string,
    targetTier: 'verified' | 'trader',
    successUrl: string,
    cancelUrl: string,
    verificationRequestId?: string
  ) => {
    const paymentData = preparePaymentData(
      userId,
      'membership',
      targetTier,
      { verification_request_id: verificationRequestId }
    );

    if (!paymentData) {
      toast({
        title: "No Payment Required",
        description: "You are exempt from membership fees",
      });
      return null;
    }

    return await createCheckoutSession(paymentData, successUrl, cancelUrl);
  };

  const createListingPayment = async (
    userId: string,
    userTier: 'verified' | 'trader',
    listingValue: number,
    successUrl: string,
    cancelUrl: string
  ) => {
    const paymentData = preparePaymentData(
      userId,
      'listing',
      userTier,
      { listing_value: listingValue }
    );

    if (!paymentData) {
      return null; // No payment required
    }

    return await createCheckoutSession(paymentData, successUrl, cancelUrl);
  };

  const verifyPaymentStatus = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { session_id: sessionId },
      });

      if (error) throw error;

      return {
        status: data.status,
        paymentIntent: data.payment_intent,
        amount: data.amount,
        currency: data.currency,
      };
    } catch (error) {
      console.error('Error verifying payment status:', error);
      return null;
    }
  };

  const handlePaymentSuccess = async (sessionId: string, verificationRequestId?: string) => {
    try {
      // Verify payment with Stripe
      const paymentStatus = await verifyPaymentStatus(sessionId);
      
      if (paymentStatus?.status === 'paid') {
        // Update our records
        if (verificationRequestId) {
          const { error } = await supabase
            .from('verification_requests')
            .update({
              payment_status: 'completed',
              payment_reference: sessionId,
            })
            .eq('id', verificationRequestId);

          if (error) throw error;
        }

        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully",
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error handling payment success:', error);
      toast({
        title: "Payment Verification Error",
        description: "Failed to verify payment status",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    loading,
    createCheckoutSession,
    createMembershipPayment,
    createListingPayment,
    verifyPaymentStatus,
    handlePaymentSuccess,
  };
};