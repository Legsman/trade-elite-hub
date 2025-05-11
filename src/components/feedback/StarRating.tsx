
import React from "react";
import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  size?: number;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  size = 16,
  className 
}) => {
  // Round to nearest half
  const roundedRating = Math.round(rating * 2) / 2;
  
  // Create an array of 5 stars
  const stars = [];
  
  for (let i = 1; i <= 5; i++) {
    if (i <= roundedRating) {
      // Full star
      stars.push(
        <Star 
          key={i} 
          size={size} 
          className="fill-yellow-400 text-yellow-400" 
        />
      );
    } else if (i - 0.5 === roundedRating) {
      // Half star
      stars.push(
        <StarHalf 
          key={i} 
          size={size} 
          className="fill-yellow-400 text-yellow-400" 
        />
      );
    } else {
      // Empty star
      stars.push(
        <Star 
          key={i} 
          size={size} 
          className="text-muted-foreground/30" 
        />
      );
    }
  }
  
  return (
    <div className={cn("flex items-center", className)}>
      {stars}
    </div>
  );
};
