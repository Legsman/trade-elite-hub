import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePaymentTracking } from './usePaymentTracking';
import { useFeeCalculation } from './useFeeCalculation';

export interface BillingCycle {
  id: string;
  user_id: string;
  billing_period_start: string;
  billing_period_end: string;
  membership_fee_due: number;
  membership_fee_paid: boolean;
  listing_fees_total: number;
  payment_due_date: string;
  status: 'pending' | 'paid' | 'overdue' | 'canceled';
  created_at: string;
  updated_at: string;
}

export interface PaymentDue {
  user_id: string;
  amount: number;
  currency: string;
  description: string;
  due_date: string;
  type: 'membership' | 'listing';
  status: 'pending' | 'overdue';
}

export const useBillingManagement = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { createPaymentRecord } = usePaymentTracking();
  const { calculateMembershipFee, preparePaymentData } = useFeeCalculation();

  const createBillingCycle = async (userId: string, tier: 'verified' | 'trader') => {
    setLoading(true);
    try {
      const now = new Date();
      const periodStart = now.toISOString();
      const periodEnd = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString();
      const dueDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString(); // 30 days from now

      const feeCalc = calculateMembershipFee(tier);
      
      if (feeCalc.isExempt || !feeCalc.feesEnabled) {
        return null; // No billing cycle needed for exempt users
      }

      // Create billing cycle record in system_settings as a structured record
      const billingCycleId = crypto.randomUUID();
      const billingCycle: BillingCycle = {
        id: billingCycleId,
        user_id: userId,
        billing_period_start: periodStart,
        billing_period_end: periodEnd,
        membership_fee_due: feeCalc.membershipFee,
        membership_fee_paid: false,
        listing_fees_total: 0,
        payment_due_date: dueDate,
        status: 'pending',
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };

      const { error } = await supabase
        .from('system_settings')
        .insert({
          setting_key: `billing_cycle_${billingCycleId}`,
          setting_type: 'billing_cycle',
          setting_value: billingCycle as any,
          description: `Billing cycle for user ${userId}`
        });

      if (error) throw error;

      return billingCycle;
    } catch (error) {
      console.error('Error creating billing cycle:', error);
      toast({
        title: "Error",
        description: "Failed to create billing cycle",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getUserBillingCycles = async (userId: string): Promise<BillingCycle[]> => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_type', 'billing_cycle')
        .like('setting_key', `billing_cycle_%`);

      if (error) throw error;

      return data
        .map(item => item.setting_value as unknown as BillingCycle)
        .filter(cycle => cycle.user_id === userId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch (error) {
      console.error('Error fetching billing cycles:', error);
      return [];
    }
  };

  const getOverduePayments = async (): Promise<PaymentDue[]> => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_type', 'billing_cycle');

      if (error) throw error;

      const now = new Date();
      const overduePayments: PaymentDue[] = [];

      data.forEach(item => {
        const cycle = item.setting_value as unknown as BillingCycle;
        const dueDate = new Date(cycle.payment_due_date);
        
        if (dueDate < now && cycle.status === 'pending') {
          overduePayments.push({
            user_id: cycle.user_id,
            amount: cycle.membership_fee_due + cycle.listing_fees_total,
            currency: 'GBP',
            description: `Overdue payment for billing cycle ${cycle.id.slice(0, 8)}`,
            due_date: cycle.payment_due_date,
            type: 'membership',
            status: 'overdue',
          });
        }
      });

      return overduePayments;
    } catch (error) {
      console.error('Error fetching overdue payments:', error);
      return [];
    }
  };

  const updateBillingCycleStatus = async (cycleId: string, status: 'pending' | 'paid' | 'overdue' | 'canceled') => {
    try {
      // Get current cycle
      const { data: currentData, error: fetchError } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', `billing_cycle_${cycleId}`)
        .single();

      if (fetchError) throw fetchError;

      const cycle = currentData.setting_value as unknown as BillingCycle;
      const updatedCycle = {
        ...cycle,
        status,
        updated_at: new Date().toISOString(),
        ...(status === 'paid' && { membership_fee_paid: true })
      };

      const { error } = await supabase
        .from('system_settings')
        .update({ setting_value: updatedCycle as any })
        .eq('setting_key', `billing_cycle_${cycleId}`);

      if (error) throw error;

      return updatedCycle;
    } catch (error) {
      console.error('Error updating billing cycle:', error);
      throw error;
    }
  };

  const addListingFeeToBillingCycle = async (userId: string, listingFee: number) => {
    try {
      // Find active billing cycle for user
      const cycles = await getUserBillingCycles(userId);
      const activeCycle = cycles.find(cycle => cycle.status === 'pending' || cycle.status === 'overdue');

      if (!activeCycle) {
        // No active cycle, payment will be handled separately
        return;
      }

      const updatedCycle = {
        ...activeCycle,
        listing_fees_total: activeCycle.listing_fees_total + listingFee,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('system_settings')
        .update({ setting_value: updatedCycle as any })
        .eq('setting_key', `billing_cycle_${activeCycle.id}`);

      if (error) throw error;

      return updatedCycle;
    } catch (error) {
      console.error('Error adding listing fee to billing cycle:', error);
      throw error;
    }
  };

  const initiatePaymentForCycle = async (cycle: BillingCycle, tier: 'verified' | 'trader') => {
    const totalAmount = cycle.membership_fee_due + cycle.listing_fees_total;
    
    const paymentData = preparePaymentData(
      cycle.user_id,
      'membership',
      tier,
      {
        billing_cycle_id: cycle.id,
        total_amount: totalAmount,
        membership_fee: cycle.membership_fee_due,
        listing_fees: cycle.listing_fees_total,
      }
    );

    if (!paymentData) {
      return null;
    }

    // Override amount to include listing fees
    paymentData.amount = Math.round(totalAmount * 100); // Convert to pence
    paymentData.description = `Billing cycle payment: Membership (£${cycle.membership_fee_due}) + Listing fees (£${cycle.listing_fees_total})`;

    return await createPaymentRecord({
      verification_request_id: cycle.id,
      amount: paymentData.amount,
      currency: paymentData.currency,
      fee_type: paymentData.feeType,
      tier_type: paymentData.tierType,
      metadata: paymentData.metadata,
    });
  };

  return {
    loading,
    createBillingCycle,
    getUserBillingCycles,
    getOverduePayments,
    updateBillingCycleStatus,
    addListingFeeToBillingCycle,
    initiatePaymentForCycle,
  };
};