
import React, { useState } from "react";
import { Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeedbackSummary } from "./FeedbackSummary";
import { FeedbackList } from "./FeedbackList";
import { FeedbackItem } from "./types";

export interface FeedbackSectionProps {
  userId?: string;
  allFeedback: FeedbackItem[];
  sellerFeedback: FeedbackItem[];
  buyerFeedback: FeedbackItem[];
  isLoading?: boolean;
  className?: string;
}

export const FeedbackSection: React.FC<FeedbackSectionProps> = ({
  userId,
  allFeedback = [],
  sellerFeedback = [],
  buyerFeedback = [],
  isLoading = false,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<string>("all");

  // Calculate statistics
  const totalFeedback = allFeedback.length;
  const averageRating = totalFeedback
    ? allFeedback.reduce((sum, item) => sum + item.rating, 0) / totalFeedback
    : 0;
  
  const sellerStats = {
    count: sellerFeedback.length,
    averageRating: sellerFeedback.length
      ? sellerFeedback.reduce((sum, item) => sum + item.rating, 0) / sellerFeedback.length
      : 0
  };
  
  const buyerStats = {
    count: buyerFeedback.length,
    averageRating: buyerFeedback.length
      ? buyerFeedback.reduce((sum, item) => sum + item.rating, 0) / buyerFeedback.length
      : 0
  };
    
  return (
    <div className={className}>
      <h2 className="text-2xl font-semibold tracking-tight mb-4">Feedback & Ratings</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full border-b rounded-none justify-start mb-4">
          <TabsTrigger value="all">All Feedback ({totalFeedback})</TabsTrigger>
          <TabsTrigger value="seller">As a Seller ({sellerStats.count})</TabsTrigger>
          <TabsTrigger value="buyer">As a Buyer ({buyerStats.count})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="space-y-6">
            <FeedbackSummary 
              averageRating={averageRating} 
              totalFeedback={totalFeedback} 
              isLoading={isLoading}
            />
            <FeedbackList 
              feedbackItems={allFeedback} 
              isLoading={isLoading}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="seller">
          <div className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-medium mb-2">Feedback from Buyers</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="font-medium">{sellerStats.averageRating.toFixed(1)}</span>
                </div>
                <span className="text-muted-foreground">({sellerStats.count} reviews)</span>
              </div>
            </div>
            <FeedbackList 
              feedbackItems={sellerFeedback} 
              isLoading={isLoading}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="buyer">
          <div className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-medium mb-2">Feedback from Sellers</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="font-medium">{buyerStats.averageRating.toFixed(1)}</span>
                </div>
                <span className="text-muted-foreground">({buyerStats.count} reviews)</span>
              </div>
            </div>
            <FeedbackList 
              feedbackItems={buyerFeedback} 
              isLoading={isLoading}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
