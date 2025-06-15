
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

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight mb-4">
        Your Sold Items
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {soldItems.map((item) => {
          // We need to know if the seller has left feedback for this sale.
          // Show button only if: there is a buyer and feedback has not been left.
          // Use the useFeedback hook to check if the current seller (user.id) has left feedback for the buyer on this listing.
          // We'll render per item for now (for small lists this is fine).
          const buyerId = item.buyer?.id;
          // Only show feedback option if there's a buyer
          let FeedbackButton = null;
          if (buyerId && user) {
            // The seller is logged in -- check if a feedback record exists from user.id to buyerId for this listing
            // Instead of a hook, useFeedback (returns { data, isLoading }), but since hooks can't be called inside loops, we'll create a FeedbackChecker component.
            FeedbackButton = (
              <FeedbackChecker
                userId={user.id}
                buyerId={buyerId}
                listingId={item.id}
                openModal={() => setFeedbackModal({ item })}
              />
            );
          }

          return (
            <div key={item.id}>
              <SoldItemCard
                item={item}
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
          onOpenChange={() => setFeedbackModal(null)}
          fromUserId={user.id}
          toUserId={feedbackModal.item.buyer?.id || ""}
          listingId={feedbackModal.item.id}
          onSubmitted={() => setFeedbackModal(null)}
        />
      )}
    </div>
  );
};

/**
 * Renders a feedback button for a single sold item, checking if feedback already exists.
 * Uses the useFeedback hook to load feedback given by userId (seller) about this buyer/listing.
 */
function FeedbackChecker({
  userId,
  buyerId,
  listingId,
  openModal,
}: {
  userId: string;
  buyerId: string;
  listingId: string;
  openModal: () => void;
}) {
  // Only fetch feedback records from seller (userId) about this buyer + listing
  const { data: feedback, isLoading } = useFeedback({
    userId,
    as: "buyer", // "buyer" here means feedback left BY this user - even though seller is author, this param controls direction in the hook
    listingId,
  });

  // We only care about feedback entries where "from_user_id" = userId and "to_user_id" = buyerId for this listing
  // (vs the buyer leaving feedback about the seller, which would be userId = buyer, to_user_id = seller)
  const alreadyLeft = Array.isArray(feedback)
    ? feedback.some(
        (fb) =>
          fb.from_user_id === userId &&
          fb.to_user_id === buyerId &&
          fb.listing_id === listingId
      )
    : false;

  return (
    <Button
      variant="secondary"
      size="sm"
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
