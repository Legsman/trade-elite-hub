import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';
import { useToast } from '@/hooks/use-toast';

export interface PaymentStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  reference: string | null;
  created_at: string;
  updated_at: string;
  verification_request_id?: string;
  stripe_session_id?: string;
  metadata?: Record<string, any>;
}

export interface VerificationPaymentStatus {
  verification_request_id: string;
  payment_status: 'pending' | 'processing' | 'completed' | 'failed';
  payment_reference: string | null;
  fee_amount: number;
  fee_currency: string;
}

export const usePaymentTracking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createPaymentRecord = async (paymentData: {
    verification_request_id?: string;
    amount: number;
    currency: string;
    fee_type: string;
    tier_type: string;
    stripe_session_id?: string;
    metadata?: Record<string, any>;
  }): Promise<string | null> => {
    if (!user) return null;

    try {
      // For now, we'll store payment tracking in verification_requests
      // In a full implementation, you might create a separate payments table
      if (paymentData.verification_request_id) {
        const { error } = await supabase
          .from('verification_requests')
          .update({
            payment_status: 'pending',
            payment_reference: paymentData.stripe_session_id,
          })
          .eq('id', paymentData.verification_request_id);

        if (error) throw error;
        return paymentData.verification_request_id;
      }

      return null;
    } catch (error) {
      console.error('Error creating payment record:', error);
      return null;
    }
  };

  const updatePaymentStatus = async (
    verificationRequestId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    reference?: string
  ): Promise<boolean> => {
    try {
      const updateData: any = {
        payment_status: status,
        updated_at: new Date().toISOString(),
      };

      if (reference) {
        updateData.payment_reference = reference;
      }

      const { error } = await supabase
        .from('verification_requests')
        .update(updateData)
        .eq('id', verificationRequestId);

      if (error) throw error;

      toast({
        title: 'Payment Status Updated',
        description: `Payment status changed to ${status}`,
      });

      return true;
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update payment status',
        variant: 'destructive',
      });
      return false;
    }
  };

  const getVerificationPaymentStatus = async (
    verificationRequestId: string
  ): Promise<VerificationPaymentStatus | null> => {
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('id, payment_status, payment_reference, request_type')
        .eq('id', verificationRequestId)
        .single();

      if (error) throw error;

      // Calculate fee amount based on request type
      const feeAmount = data.request_type === 'verified' ? 35 : 108;

      return {
        verification_request_id: data.id,
        payment_status: (data.payment_status || 'pending') as 'pending' | 'processing' | 'completed' | 'failed',
        payment_reference: data.payment_reference,
        fee_amount: feeAmount,
        fee_currency: 'GBP',
      };
    } catch (error) {
      console.error('Error fetching payment status:', error);
      return null;
    }
  };

  const getUserPaymentHistory = async (): Promise<VerificationPaymentStatus[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('id, payment_status, payment_reference, request_type, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(item => ({
        verification_request_id: item.id,
        payment_status: (item.payment_status || 'pending') as 'pending' | 'processing' | 'completed' | 'failed',
        payment_reference: item.payment_reference,
        fee_amount: item.request_type === 'verified' ? 35 : 108,
        fee_currency: 'GBP',
      }));
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return [];
    }
  };

  const processPaymentCompletion = async (
    verificationRequestId: string,
    stripeSessionId: string
  ): Promise<boolean> => {
    setLoading(true);
    try {
      // Update payment status to completed
      const success = await updatePaymentStatus(
        verificationRequestId,
        'completed',
        stripeSessionId
      );

      if (success) {
        // Here you could trigger additional actions like:
        // - Sending confirmation emails
        // - Updating user permissions
        // - Creating audit logs
        toast({
          title: 'Payment Successful',
          description: 'Your verification payment has been processed successfully.',
        });
      }

      return success;
    } catch (error) {
      console.error('Error processing payment completion:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentFailure = async (
    verificationRequestId: string,
    reason?: string
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const success = await updatePaymentStatus(verificationRequestId, 'failed');

      if (success) {
        toast({
          title: 'Payment Failed',
          description: reason || 'Your payment could not be processed. Please try again.',
          variant: 'destructive',
        });
      }

      return success;
    } catch (error) {
      console.error('Error handling payment failure:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createPaymentRecord,
    updatePaymentStatus,
    getVerificationPaymentStatus,
    getUserPaymentHistory,
    processPaymentCompletion,
    handlePaymentFailure,
    loading,
  };
};