
import React from "react";
import { FeedbackSection } from "./FeedbackSection";
import { FeedbackItem } from "./types";

const mockFeedbackItems: FeedbackItem[] = [
  {
    id: "1",
    userId: "user-1",
    rating: 5,
    comment: "Great seller! Item was exactly as described and arrived quickly.",
    createdAt: new Date(2024, 4, 1),
    transactionType: "Purchase",
    user: {
      id: "user-2",
      name: "Jane Cooper",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane"
    }
  },
  {
    id: "2",
    userId: "user-1",
    rating: 4,
    comment: "Good communication and fast shipping. Would buy from again.",
    createdAt: new Date(2024, 3, 15),
    transactionType: "Purchase",
    user: {
      id: "user-3",
      name: "Alex Johnson",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
    }
  },
  {
    id: "3",
    userId: "user-1",
    rating: 5,
    comment: "Excellent service! Very prompt and professional.",
    createdAt: new Date(2024, 3, 5),
    transactionType: "Sale",
    user: {
      id: "user-4",
      name: "Sam Wilson",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam"
    }
  }
];

export const FeedbackDemo: React.FC = () => {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Feedback Component Demo</h1>
      <div className="max-w-2xl mx-auto">
        <FeedbackSection 
          userId="user-1"
          feedbackItems={mockFeedbackItems}
          isLoading={false}
        />
      </div>
    </div>
  );
};
