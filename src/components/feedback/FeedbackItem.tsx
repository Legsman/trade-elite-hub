
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "./StarRating";
import { FeedbackItem as FeedbackItemType } from "./types";
import { getInitials } from "@/lib/utils";

interface FeedbackItemProps {
  item: FeedbackItemType;
}

export const FeedbackItem: React.FC<FeedbackItemProps> = ({ item }) => {
  const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true });

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex justify-between">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={item.user.avatarUrl || ""} alt={item.user.name} />
            <AvatarFallback>{getInitials(item.user.name)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{item.user.name}</span>
        </div>
        <StarRating rating={item.rating} size={16} />
      </div>

      <p className="text-sm">{item.comment}</p>

      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>{timeAgo}</span>
        <span>For: {item.transactionType}</span>
      </div>
    </div>
  );
};
