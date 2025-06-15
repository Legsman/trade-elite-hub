
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LeaveFeedbackModal } from "@/components/feedback/LeaveFeedbackModal";
import { useAuth } from "@/hooks/auth";
import { useFeedback } from "@/hooks/feedback";

interface PurchaseHistoryTabProps {
  userId: string;
}

export const PurchaseHistoryTab = ({ userId }: PurchaseHistoryTabProps) => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackModal, setFeedbackModal] = useState<null | { purchase: any }>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPurchases = async () => {
      setIsLoading(true);
      try {
        // Purchases by accepted offer
        const { data: offerPurchases, error: offerError } = await supabase
          .from("listings")
          .select(`
            *,
            profiles: seller_id (
              id,
              full_name
            )
          `)
          .eq("sale_buyer_id", userId)
          .eq("status", "sold");

        if (offerError) throw offerError;

        // Purchases by auction win (relies on same sale fields, so already included above)
        const purchasedListings = (offerPurchases || []).map((l) => ({
          ...l,
          purchaseType: 'offerOrAuction',
          purchaseAmount: l.sale_amount,
          purchaseDate: l.sale_date ? new Date(l.sale_date) : undefined,
          expiresAt: new Date(l.expires_at),
          seller: l.profiles ? {
            id: l.profiles.id,
            name: l.profiles.full_name
          } : null
        }));

        // Sort by purchase date
        purchasedListings.sort((a, b) => {
          if (!a.purchaseDate || !b.purchaseDate) return 0;
          return b.purchaseDate.getTime() - a.purchaseDate.getTime();
        });

        setPurchases(purchasedListings);
      } catch (error) {
        console.error("Error fetching purchase history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchases();
  }, [userId]);

  if (isLoading) {
    return <Loading message="Loading purchase history..." />;
  }
  
  if (purchases.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <h3 className="text-lg font-medium mb-2">No purchase history yet</h3>
        <p className="text-sm">Items you buy will appear here.</p>
        <Button variant="link" onClick={() => navigate("/listings")}>
          Browse Listings
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight mb-4">
        Your Purchase History
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {purchases.map(purchase => {
          // Remove previous mock hasFeedback flag.
          return (
            <Card key={purchase.id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-1/4 md:w-1/5">
                  <img
                    src={purchase.images[0]}
                    alt={purchase.title}
                    className="w-full h-40 object-cover"
                  />
                </div>
                <div className="p-4 flex-1">
                  <h3 className="font-semibold text-lg mb-1">{purchase.title}</h3>
                  <div className="text-sm text-muted-foreground mb-2">
                    {purchase.purchaseDate
                      ? new Intl.DateTimeFormat('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }).format(purchase.purchaseDate)
                      : ""}
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Purchase price:</span>{" "}
                    <span className="text-green-600 font-bold">
                      £{purchase.purchaseAmount ? Number(purchase.purchaseAmount).toLocaleString() : "-"}
                    </span>
                  </div>
                  <div className="text-sm mb-4">
                    <span className="bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-xs">
                      Sale
                    </span>
                  </div>
                  {purchase.seller && (
                    <div className="mb-2 text-sm">
                      <span className="font-medium">Seller:</span>{" "}
                      <span>{purchase.seller.name ?? "Unknown"}</span>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/listings/${purchase.id}`)}
                  >
                    View Details
                  </Button>
                  {user && purchase.seller?.id &&
                    <FeedbackChecker
                      buyerId={user.id}
                      sellerId={purchase.seller.id}
                      listingId={purchase.id}
                      openModal={() => setFeedbackModal({ purchase })}
                    />
                  }
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {feedbackModal && user && (
        <LeaveFeedbackModal
          open={!!feedbackModal}
          onOpenChange={() => setFeedbackModal(null)}
          fromUserId={user.id}
          toUserId={feedbackModal.purchase.seller?.id || ""}
          listingId={feedbackModal.purchase.id}
          onSubmitted={() => setFeedbackModal(null)}
        />
      )}
    </div>
  );
};

// Check if the current user (buyer) already left feedback for this seller/listing
function FeedbackChecker({
  buyerId,
  sellerId,
  listingId,
  openModal
}: {
  buyerId: string;
  sellerId: string;
  listingId: string;
  openModal: () => void;
}) {
  // as="seller" means feedback about this seller (to_user_id=sellerId, from_user_id=buyerId)
  const { data: feedback, isLoading } = useFeedback({
    userId: buyerId,
    as: "seller",
    listingId,
  });

  // Look for feedback where from_user_id == buyerId, to_user_id == sellerId, for this listing
  const alreadyLeft = Array.isArray(feedback)
    ? feedback.some(
      (fb) =>
        fb.from_user_id === buyerId &&
        fb.to_user_id === sellerId &&
        fb.listing_id === listingId
    )
    : false;

  return (
    <Button
      variant="secondary"
      size="sm"
      className="ml-2"
      disabled={alreadyLeft || isLoading}
      onClick={openModal}
    >
      {isLoading
        ? "Checking..."
        : alreadyLeft
        ? "Feedback Submitted"
        : "Leave Feedback"}
    </Button>
  );
}

