import { useFeesManagement } from './useFeesManagement';
import { useUserVerification } from '@/hooks/auth/useUserVerification';
import { useIsAdmin } from '@/hooks/useIsAdmin';

export interface FeeCalculation {
  membershipFee: number;
  listingFee: number;
  currency: string;
  tierName: string;
  feesEnabled: boolean;
  isExempt: boolean; // For admins
}

export interface PaymentPrepData {
  amount: number;
  currency: string;
  description: string;
  feeType: 'membership' | 'listing';
  tierType: 'verified' | 'trader';
  userId: string;
  metadata: Record<string, any>;
}

export const useFeeCalculation = () => {
  const { settings } = useFeesManagement();
  const { level: verificationLevel } = useUserVerification();
  const { isAdmin } = useIsAdmin();

  const calculateMembershipFee = (targetTier: 'verified' | 'trader'): FeeCalculation => {
    if (!settings) {
      return {
        membershipFee: 0,
        listingFee: 0,
        currency: 'GBP',
        tierName: targetTier,
        feesEnabled: false,
        isExempt: isAdmin,
      };
    }

    const feesEnabled = settings.fees_enabled?.enabled || false;
    
    if (isAdmin) {
      return {
        membershipFee: 0,
        listingFee: 0,
        currency: 'GBP',
        tierName: 'Admin',
        feesEnabled,
        isExempt: true,
      };
    }

    const membershipFee = targetTier === 'verified' 
      ? settings.verified_membership_fee?.amount || 35
      : settings.trader_membership_fee?.amount || 108;

    const listingFee = targetTier === 'verified'
      ? settings.verified_listing_fee?.amount || 3.50
      : settings.trader_listing_fee?.amount || 1.50;

    return {
      membershipFee: feesEnabled ? membershipFee : 0,
      listingFee: feesEnabled ? listingFee : 0,
      currency: 'GBP',
      tierName: targetTier === 'verified' ? 'Verified' : 'Trader',
      feesEnabled,
      isExempt: false,
    };
  };

  const calculateListingFee = (userTier: string): number => {
    if (!settings || isAdmin || !settings.fees_enabled?.enabled) {
      return 0;
    }

    switch (userTier) {
      case 'verified':
        return settings.verified_listing_fee?.amount || 3.50;
      case 'trader':
        return settings.trader_listing_fee?.amount || 1.50;
      default:
        return 0;
    }
  };

  const preparePaymentData = (
    userId: string,
    feeType: 'membership' | 'listing',
    targetTier: 'verified' | 'trader',
    additionalMetadata: Record<string, any> = {}
  ): PaymentPrepData | null => {
    const feeCalc = calculateMembershipFee(targetTier);
    
    if (feeCalc.isExempt || !feeCalc.feesEnabled) {
      return null; // No payment required
    }

    const amount = feeType === 'membership' ? feeCalc.membershipFee : feeCalc.listingFee;
    
    if (amount <= 0) {
      return null;
    }

    return {
      amount: Math.round(amount * 100), // Convert to pence for Stripe
      currency: feeCalc.currency.toLowerCase(),
      description: `${feeCalc.tierName} ${feeType === 'membership' ? 'Annual Membership' : 'Listing Fee'}`,
      feeType,
      tierType: targetTier,
      userId,
      metadata: {
        tier: targetTier,
        feeType,
        tierName: feeCalc.tierName,
        ...additionalMetadata,
      },
    };
  };

  const getFeeBreakdown = (targetTier: 'verified' | 'trader') => {
    const feeCalc = calculateMembershipFee(targetTier);
    
    return {
      ...feeCalc,
      breakdown: [
        {
          name: 'Annual Membership',
          amount: feeCalc.membershipFee,
          currency: feeCalc.currency,
          period: 'yearly',
        },
        {
          name: 'Per Listing Fee',
          amount: feeCalc.listingFee,
          currency: feeCalc.currency,
          period: 'per listing',
        },
      ],
      limits: targetTier === 'verified' ? {
        monthlyItems: settings?.verified_monthly_limit?.items || 3,
        yearlyValue: settings?.verified_monthly_limit?.value || 12500,
      } : null,
    };
  };

  return {
    calculateMembershipFee,
    calculateListingFee,
    preparePaymentData,
    getFeeBreakdown,
    settings,
    isAdmin,
    verificationLevel,
  };
};