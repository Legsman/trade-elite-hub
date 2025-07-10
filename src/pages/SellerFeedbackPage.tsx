import { useParams, useNavigate } from "react-router-dom";
import { useFeedback } from "@/hooks/feedback";
import { useSellerProfile } from "@/hooks/user-profile";
import MainLayout from "@/components/layout/MainLayout";
import { Loading } from "@/components/ui/loading";
import { FeedbackSection } from "@/components/feedback/FeedbackSection";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
const SellerFeedbackPage = () => {
  const {
    sellerId
  } = useParams<{
    sellerId: string;
  }>();
  const navigate = useNavigate();
  const {
    seller,
    isLoading: sellerLoading
  } = useSellerProfile(sellerId);

  // Fetch feedback received as seller
  const {
    data: sellerFeedback,
    isLoading: sellerFeedbackLoading
  } = useFeedback({
    userId: sellerId,
    as: "seller",
    listingId: null
  });

  // Fetch feedback received as buyer
  const {
    data: buyerFeedback,
    isLoading: buyerFeedbackLoading
  } = useFeedback({
    userId: sellerId,
    as: "buyer",
    listingId: null
  });
  if (sellerLoading) {
    return <MainLayout>
        <div className="container py-8">
          <Loading message="Loading seller information..." />
        </div>
      </MainLayout>;
  }
  if (!seller) {
    return <MainLayout>
        <div className="container py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Seller Not Found</h2>
          <p className="text-muted-foreground mb-6">The seller you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </MainLayout>;
  }
  const isLoading = sellerFeedbackLoading || buyerFeedbackLoading;

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

  // Combine all feedback
  const allFeedback = [...transformSellerFeedback, ...transformBuyerFeedback].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return <MainLayout>
      <div className="container py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          {/* Seller Info Header */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Seller Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  {seller.avatarUrl ? <img src={seller.avatarUrl} alt={seller.username || "seller"} className="h-16 w-16 rounded-full object-cover" /> : <User className="h-8 w-8 text-muted-foreground" />}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">
                    {seller.username ? `@${seller.username}` : "Unknown Seller"}
                  </h2>
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="font-medium">
                      {seller.feedbackCount > 0 ? seller.rating.toFixed(1) : "No rating"}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">
                      ({seller.feedbackCount} {seller.feedbackCount === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <h1 className="text-3xl font-bold">Feedback & Reviews</h1>
          <p className="text-muted-foreground mt-2">See what others are saying about this user.</p>
        </div>

        <FeedbackSection userId={sellerId} allFeedback={allFeedback} sellerFeedback={transformSellerFeedback} buyerFeedback={transformBuyerFeedback} isLoading={isLoading} />
      </div>
    </MainLayout>;
};
export default SellerFeedbackPage;