
import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "./StarRating";

interface FeedbackSummaryProps {
  averageRating: number;
  totalFeedback: number;
  isLoading?: boolean;
}

export const FeedbackSummary: React.FC<FeedbackSummaryProps> = ({ 
  averageRating, 
  totalFeedback, 
  isLoading = false 
}) => {
  // Calculate distribution of ratings (mock data for now, could be passed as props)
  const ratingDistribution = [
    { stars: 5, count: Math.floor(totalFeedback * 0.6), percentage: 60 },
    { stars: 4, count: Math.floor(totalFeedback * 0.25), percentage: 25 },
    { stars: 3, count: Math.floor(totalFeedback * 0.1), percentage: 10 },
    { stars: 2, count: Math.floor(totalFeedback * 0.03), percentage: 3 },
    { stars: 1, count: Math.floor(totalFeedback * 0.02), percentage: 2 },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center py-6">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-6 w-32 mt-3" />
          <Skeleton className="h-4 w-24 mt-2" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-8" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (totalFeedback === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <Star className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
        <h3 className="text-lg font-medium">No feedback yet</h3>
        <p className="mt-1 text-sm">Be the first to leave feedback for this user.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Average rating display */}
      <div className="flex flex-col items-center py-6">
        <div className="flex items-center">
          <span className="text-4xl font-bold mr-2">
            {averageRating.toFixed(1)}
          </span>
          <StarRating rating={averageRating} size={24} />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Based on {totalFeedback} {totalFeedback === 1 ? "review" : "reviews"}
        </p>
      </div>

      {/* Rating distribution */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          {ratingDistribution.map((item) => (
            <div key={item.stars} className="flex items-center space-x-2">
              <div className="flex items-center w-12">
                {item.stars} <Star className="h-4 w-4 ml-1 fill-yellow-400 text-yellow-400" />
              </div>
              <Progress value={item.percentage} className="h-2 flex-1" />
              <div className="text-sm text-muted-foreground w-8 text-right">
                {item.count}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
