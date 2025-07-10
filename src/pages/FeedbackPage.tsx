import { useAuth } from "@/hooks/auth";
import { useFeedback } from "@/hooks/feedback";
import MainLayout from "@/components/layout/MainLayout";
import { Loading } from "@/components/ui/loading";
import { FeedbackSection } from "@/components/feedback/FeedbackSection";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
const FeedbackPage = () => {
  const navigate = useNavigate();
  const {
    user,
    loading: authLoading
  } = useAuth();

  // Fetch feedback received as seller (feedback from buyers)
  const {
    data: sellerFeedback,
    isLoading: sellerLoading
  } = useFeedback({
    userId: user?.id,
    as: "seller",
    listingId: null
  });

  // Fetch feedback received as buyer (feedback from sellers)
  const {
    data: buyerFeedback,
    isLoading: buyerLoading
  } = useFeedback({
    userId: user?.id,
    as: "buyer",
    listingId: null
  });
  if (authLoading) {
    return <MainLayout>
        <div className="container py-8">
          <Loading message="Loading feedback..." />
        </div>
      </MainLayout>;
  }
  if (!user) {
    return <MainLayout>
        <div className="container py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">Please log in to view your feedback.</p>
          <Button onClick={() => navigate("/login")}>Log In</Button>
        </div>
      </MainLayout>;
  }
  const isLoading = sellerLoading || buyerLoading;

  // Transform feedback data
  const transformSellerFeedback = (sellerFeedback || []).map(item => ({
    id: item.id,
    userId: item.from_user_id,
    rating: item.rating,
    comment: item.comment || '',
    createdAt: item.created_at,
    transactionType: 'seller',
    user: {
      id: item.from_user_id,
      username: (item.from_user as any)?.username || 'Unknown User',
      avatarUrl: (item.from_user as any)?.avatar_url || null
    }
  }));
  const transformBuyerFeedback = (buyerFeedback || []).map(item => ({
    id: item.id,
    userId: item.from_user_id,
    rating: item.rating,
    comment: item.comment || '',
    createdAt: item.created_at,
    transactionType: 'buyer',
    user: {
      id: item.from_user_id,
      username: (item.from_user as any)?.username || 'Unknown User',
      avatarUrl: (item.from_user as any)?.avatar_url || null
    }
  }));

  // Combine all feedback for the "All" tab
  const allFeedback = [...transformSellerFeedback, ...transformBuyerFeedback].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return <MainLayout>
      <div className="container py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">My Feedback</h1>
          <p className="text-muted-foreground mt-2">View all feedback you've received.</p>
        </div>

        <FeedbackSection userId={user.id} allFeedback={allFeedback} sellerFeedback={transformSellerFeedback} buyerFeedback={transformBuyerFeedback} isLoading={isLoading} />
      </div>
    </MainLayout>;
};
export default FeedbackPage;