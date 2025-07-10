
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { User, Shield, Star, ThumbsUp } from "lucide-react";
import { NavigateFunction } from "react-router-dom";
import { Listing, User as UserType } from "@/types";
import { isListingEnded } from "@/utils/listingStatus";

interface SellerInfoCardProps {
  seller: {
    id: string;
    avatarUrl?: string;
    joinDate: Date;
    rating: number;
    salesCount: number;
    verified: boolean;
    username?: string | null;
    feedbackCount: number;
  };
  navigate: NavigateFunction;
  listing: Listing;
  user?: UserType;
}

export const SellerInfoCard = ({ seller, navigate, listing, user }: SellerInfoCardProps) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  // Show the Leave Feedback button only if:
  // 1. The listing has ended
  // 2. The current user is the winner (saleBuyerId)
  // 3. The user is authenticated
  const shouldShowFeedbackButton = user && 
    isListingEnded(listing) && 
    listing.saleBuyerId === user.id;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seller Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mr-3">
            {seller.avatarUrl ? (
              <img 
                src={seller.avatarUrl} 
                alt={seller.username || "unknown"}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <User className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div>
            <div className="font-medium flex items-center">
              {seller.username ? (
                <span className="text-foreground">@{seller.username}</span>
              ) : (
                <span className="text-foreground">@unknown</span>
              )}
              {seller.verified && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Shield className="ml-1 h-4 w-4 text-green-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Verified Seller</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Member since {formatDate(seller.joinDate)}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
            <span className="font-medium">
              {seller.feedbackCount > 0 ? seller.rating.toFixed(1) : "No rating"}
            </span>
            <span className="text-sm text-muted-foreground ml-1">
              ({seller.feedbackCount} feedback)
            </span>
          </div>
          <Button variant="link" size="sm" className="p-0" onClick={() => navigate(`/sellers/${seller.id}/feedback`)}>
            View Feedback
          </Button>
        </div>
        <Separator />
        <div className="p-3 border rounded-md bg-muted/20 text-sm">
          <div className="flex items-start">
            <Shield className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
            <p>
              Always communicate through our platform and never share personal contact details. 
              Report suspicious activity immediately.
            </p>
          </div>
        </div>
        {shouldShowFeedbackButton && (
          <Button 
            className="w-full" 
            variant="outline" 
            onClick={() => navigate(`/feedback/new?user=${seller.id}`)}
          >
            <ThumbsUp className="mr-2 h-4 w-4" />
            Leave Feedback
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

