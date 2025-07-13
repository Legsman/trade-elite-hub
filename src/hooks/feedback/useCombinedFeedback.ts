import { useQuery } from "@tanstack/react-query";
import { useFeedback } from "./useFeedback";

interface CombinedFeedbackStats {
  averageRating: number | null;
  count: number;
  sellerCount: number;
  buyerCount: number;
}

// Hook to get combined feedback (both as seller and buyer) for a user
export function useCombinedFeedback(userId: string | undefined): {
  data: CombinedFeedbackStats | null;
  isLoading: boolean;
  error: any;
} {
  // Fetch feedback as seller
  const { 
    data: sellerFeedback, 
    isLoading: sellerLoading, 
    error: sellerError 
  } = useFeedback({
    userId,
    as: "seller",
    listingId: null
  });

  // Fetch feedback as buyer
  const { 
    data: buyerFeedback, 
    isLoading: buyerLoading, 
    error: buyerError 
  } = useFeedback({
    userId,
    as: "buyer", 
    listingId: null
  });

  const isLoading = sellerLoading || buyerLoading;
  const error = sellerError || buyerError;

  // Calculate combined statistics
  const data = isLoading || error || !userId ? null : (() => {
    const sellerFeedbackArray = sellerFeedback || [];
    const buyerFeedbackArray = buyerFeedback || [];
    const combinedFeedback = [...sellerFeedbackArray, ...buyerFeedbackArray];
    
    const count = combinedFeedback.length;
    const averageRating = count > 0 
      ? combinedFeedback.reduce((sum, fb) => sum + fb.rating, 0) / count
      : null;

    return {
      averageRating,
      count,
      sellerCount: sellerFeedbackArray.length,
      buyerCount: buyerFeedbackArray.length
    };
  })();

  return {
    data,
    isLoading,
    error
  };
}