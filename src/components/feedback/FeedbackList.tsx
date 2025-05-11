
import React from "react";
import { FeedbackItem as FeedbackItemType } from "./types";
import { FeedbackItem } from "./FeedbackItem";
import { Skeleton } from "@/components/ui/skeleton";

interface FeedbackListProps {
  feedbackItems: FeedbackItemType[];
  isLoading?: boolean;
}

export const FeedbackList: React.FC<FeedbackListProps> = ({ 
  feedbackItems,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (feedbackItems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <h3 className="text-lg font-medium mb-2">No feedback yet</h3>
        <p className="text-sm">Be the first to leave feedback.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedbackItems.map((item) => (
        <FeedbackItem key={item.id} item={item} />
      ))}
    </div>
  );
};
