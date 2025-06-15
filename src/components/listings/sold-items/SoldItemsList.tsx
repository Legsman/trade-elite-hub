
import React, { useState } from "react";
import { SoldItemCard } from "./SoldItemCard";
import { EmptyStateMessage } from "./EmptyStateMessage";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { LeaveFeedbackModal } from "@/components/feedback/LeaveFeedbackModal";
import { useAuth } from "@/hooks/auth";
import { useFeedback } from "@/hooks/feedback";
 
interface SoldItemsListProps {
  soldItems: any[];
  isLoading: boolean;
  onRelistClick: (item: any) => void;
}

export const SoldItemsList: React.FC<SoldItemsListProps> = ({
  soldItems,
  isLoading,
  onRelistClick,
}) => {
  const { user } = useAuth();
  const [feedbackModal, setFeedbackModal] = useState<null | { item: any }>(null);

  if (isLoading) {
    return <Loading message="Loading sold items..." />;
  }

  if (soldItems.length === 0) {
    return <EmptyStateMessage />;
  }

  // Debug: show loaded sold items
  if (process.env.NODE_ENV === "development") {
    console.log("[SoldItemsList] Sold items loaded:", soldItems);
    if (user) {
      console.log("[SoldItemsList] Current user:", user);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight mb-4">
        Your Sold Items
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {soldItems.map((item, idx) => {
          // Show username (not name) for privacy
          const buyerId = item.buyer?.id;
          const buyerUsername = item.buyer?.username;

          if (process.env.NODE_ENV === "development") {
            console.log(`[SoldItemsList] Item[${idx}]`, {
              id: item.id,
              title: item.title,
              sale_buyer_id: item.sale_buyer_id,
              buyer: item.buyer,
              buyerId,
              buyerUsername,
              currentUserId: user?.id,
            });
          }

          let FeedbackButton = null;
          if (buyerId && user) {
            if (process.env.NODE_ENV === "development") {
              console.log(
                `[SoldItemsList] Rendering FeedbackChecker for item ${item.id}`,
                {
                  sellerId: user.id,
                  buyerId,
                  buyerUsername,
                  listingId: item.id,
                }
              );
            }
            FeedbackButton = (
              <FeedbackChecker
                userId={user.id}
                buyerId={buyerId}
                buyerUsername={buyerUsername}
                listingId={item.id}
                openModal={() => {
                  if (process.env.NODE_ENV === "development") {
                    console.log(
                      `[SoldItemsList] Opening LeaveFeedbackModal for listingId ${item.id} to buyerId ${buyerId}`
                    );
                  }
                  setFeedbackModal({ item });
                }}
              />
            );
          } else {
            if (process.env.NODE_ENV === "development") {
              console.log(`[SoldItemsList] No FeedbackChecker rendered for item ${item.id}`, {
                reason: !buyerId
                  ? "No buyerId"
                  : !user
                  ? "No current user"
                  : "Unknown",
              });
            }
          }

          return (
            <div key={item.id}>
              <SoldItemCard
                item={{
                  ...item,
                  // Ensure component only displays buyer as username not full_name
                  buyer: item.buyer
                    ? {
                        id: item.buyer.id,
                        username: item.buyer.username,
                        avatar: item.buyer.avatar,
                      }
                    : null,
                }}
                onRelistClick={onRelistClick}
              />
              {FeedbackButton && (
                <div className="flex gap-2 mt-2">
                  {FeedbackButton}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {feedbackModal && user && (
        <LeaveFeedbackModal
          open={!!feedbackModal}
          onOpenChange={(open) => {
            if (process.env.NODE_ENV === "development") {
              console.log(
                "[SoldItemsList] Modal open change triggered",
                { open, feedbackModal }
              );
            }
            setFeedbackModal(open ? feedbackModal : null);
          }}
          fromUserId={user.id}
          toUserId={feedbackModal.item.buyer?.id || ""}
          listingId={feedbackModal.item.id}
          onSubmitted={() => {
            if (process.env.NODE_ENV === "development") {
              console.log("[SoldItemsList] Feedback submitted, closing modal");
            }
            setFeedbackModal(null);
          }}
        />
      )}
    </div>
  );
};

/**
 * Renders a feedback button for a single sold item, checking if feedback already exists.
 * Now fetches feedbacks where "from_user_id" (the seller) left feedback to "to_user_id" (the buyer) for this listing.
 */
function FeedbackChecker({
  userId,
  buyerId,
  buyerUsername,
  listingId,
  openModal,
}: {
  userId: string; // seller id
  buyerId: string; // buyer id
  buyerUsername?: string;
  listingId: string;
  openModal: () => void;
}) {
  // Fetch feedbacks given BY this seller for this listing
  const { data: feedback, isLoading } = useFeedback({
    userId,
    as: "giver",
    listingId,
  });

  // Filter for records where to_user_id matches our buyer for this listing
  const alreadyLeft = Array.isArray(feedback)
    ? feedback.some(
        (fb) =>
          fb.from_user_id === userId &&
          fb.to_user_id === buyerId &&
          fb.listing_id === listingId
      )
    : false;

  if (process.env.NODE_ENV === "development") {
    console.log("[FeedbackChecker:sold-items]", {
      userId,
      buyerId,
      listingId,
      feedback,
      alreadyLeft,
    });
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={alreadyLeft || isLoading}
      onClick={openModal}
      title={buyerUsername ? `Leave feedback for @${buyerUsername}` : ""}
    >
      {isLoading
        ? "Checking..."
        : alreadyLeft
        ? "Feedback Submitted"
        : "Leave Feedback"}
    </Button>
  );
}

