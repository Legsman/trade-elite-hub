import React, { useState } from "react";
import { SoldItemCard } from "./SoldItemCard";
import { EmptyStateMessage } from "./EmptyStateMessage";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { LeaveFeedbackModal } from "@/components/feedback/LeaveFeedbackModal";
import { useAuth } from "@/hooks/auth";

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
        {soldItems.map(item => {
          const hasFeedback = item.buyer_feedback_left; // placeholder for real flag
          return (
            <div key={item.id}>
              <SoldItemCard
                item={item}
                onRelistClick={onRelistClick}
              />
              {item.buyer && (
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={hasFeedback}
                    onClick={() => setFeedbackModal({ item })}
                  >
                    {hasFeedback ? "Feedback Submitted" : "Leave Feedback"}
                  </Button>
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
