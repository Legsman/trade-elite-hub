
import React, { useState } from "react";
import { Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeedbackSummary } from "./FeedbackSummary";
import { FeedbackList } from "./FeedbackList";
import { FeedbackItem } from "./types";

export interface FeedbackSectionProps {
  userId?: string;
  feedbackItems: FeedbackItem[];
  isLoading?: boolean;
  className?: string;
}

export const FeedbackSection: React.FC<FeedbackSectionProps> = ({
  userId,
  feedbackItems = [],
  isLoading = false,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<string>("summary");

  // Calculate average rating
  const averageRating = feedbackItems.length
    ? feedbackItems.reduce((sum, item) => sum + item.rating, 0) / feedbackItems.length
    : 0;
    
  return (
    <div className={className}>
      <h2 className="text-2xl font-semibold tracking-tight mb-4">Feedback & Ratings</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full border-b rounded-none justify-start mb-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="detailed">All Feedback</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <FeedbackSummary 
            averageRating={averageRating} 
            totalFeedback={feedbackItems.length} 
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="detailed">
          <FeedbackList 
            feedbackItems={feedbackItems} 
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
