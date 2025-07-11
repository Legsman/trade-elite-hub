import { useFeesManagement } from './useFeesManagement';
import { useFeeCalculation } from './useFeeCalculation';
import { useBillingManagement } from './useBillingManagement';
import { useStripeIntegration } from './useStripeIntegration';
import { usePaymentTracking } from './usePaymentTracking';

// Central fee management hook that orchestrates all fee-related operations
export const useFeeManagement = () => {
  const feesManagement = useFeesManagement();
  const feeCalculation = useFeeCalculation();
  const billingManagement = useBillingManagement();
  const stripeIntegration = useStripeIntegration();
  const paymentTracking = usePaymentTracking();

  return {
    // Settings management
    ...feesManagement,
    
    // Fee calculations
    ...feeCalculation,
    
    // Billing cycle management
    ...billingManagement,
    
    // Stripe integration
    ...stripeIntegration,
    
    // Payment tracking
    ...paymentTracking,
    
    // Combined loading state
    isLoading: feesManagement.loading || billingManagement.loading || stripeIntegration.loading,
  };
};