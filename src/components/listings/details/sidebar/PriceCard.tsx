
import { Loader2, Heart, Share2, MessageSquare, MapPin, Gavel } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ListingCountdown, CollapsibleBidForm } from "@/components/listings";
import { toast } from "@/hooks/use-toast";
import { Listing } from "@/types";
import { User } from "@/types";
import { NavigateFunction } from "react-router-dom";
import { BidStatusWithAdaptation } from "@/hooks/listings/bids/types";

interface PriceCardProps {
  listing: Listing;
  user?: User;
  isSaved: boolean;
  savingState: boolean;
  isOwner: boolean;
  handleToggleSave: () => Promise<void>;
  handleShare: () => void;
  onContactClick: () => void;
  onRelistClick: () => void;
  navigate: NavigateFunction;
  setActiveTab: (tab: string) => void;
  displayPrice: number;
  highestBid?: number | null;
  handlePlaceBid: (amount: number) => Promise<{ success: boolean } | undefined>;
  userBidStatus: BidStatusWithAdaptation;
}

export const PriceCard = ({
  listing,
  user,
  isSaved,
  savingState,
  isOwner,
  handleToggleSave,
  handleShare,
  onContactClick,
  onRelistClick,
  navigate,
  setActiveTab,
  displayPrice,
  highestBid,
  handlePlaceBid,
  userBidStatus
}: PriceCardProps) => {
  const isAuction = listing.type === "auction";
  const isSold = listing.status === "sold";

  return (
    <Card className={isSold ? "border-green-500" : ""}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{listing.title}</h1>
            <div className="flex items-center mt-1 text-muted-foreground text-sm">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              {listing.location}
            </div>
          </div>
          <Badge variant={isSold ? "success" : isAuction ? "secondary" : "outline"}>
            {isSold ? "Sold" : isAuction ? "Auction" : "For Sale"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Show appropriate price/bid info */}
        {isSold ? (
          <div className="flex items-baseline">
            <span className="text-lg font-medium text-muted-foreground mr-2">Sold for:</span>
            <span className="text-3xl font-bold text-green-600">£{displayPrice.toLocaleString()}</span>
          </div>
        ) : isAuction ? (
          listing.sellerId !== user?.id && user && !isSold ? (
            <CollapsibleBidForm
              listingId={listing.id}
              currentPrice={displayPrice}
              highestBid={highestBid}
              onPlaceBid={handlePlaceBid}
              userBidStatus={userBidStatus}
              expiryDate={listing.expiresAt}
            />
          ) : (
            <div className="space-y-1">
              {displayPrice ? (
                <div className="flex items-baseline">
                  <div className="flex items-center">
                    <Gavel className="h-4 w-4 mr-1 text-purple" />
                    <span className="text-sm text-muted-foreground">Current bid:</span>
                  </div>
                  <span className="text-3xl font-bold text-purple ml-2">£{displayPrice.toLocaleString()}</span>
                </div>
              ) : (
                <div className="flex items-baseline">
                  <div className="flex items-center">
                    <Gavel className="h-4 w-4 mr-1" />
                    <span className="text-sm text-muted-foreground">Starting bid:</span>
                  </div>
                  <span className="text-3xl font-bold text-purple ml-2">£{listing.price.toLocaleString()}</span>
                </div>
              )}
            </div>
          )
        ) : (
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-purple">£{listing.price.toLocaleString()}</span>
            {listing.allowBestOffer && !isSold && (
              <Badge variant="outline" className="ml-2">
                Offers Accepted
              </Badge>
            )}
          </div>
        )}
        
        {/* Countdown - don't show for sold items */}
        {!isSold ? (
          <ListingCountdown 
            expiryDate={listing.expiresAt} 
            isAuction={isAuction}
            listingStatus={listing.status}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            This item is no longer available
          </p>
        )}
        
        {/* Options for seller to relist if owner */}
        {isSold && isOwner && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={onRelistClick}
          >
            Relist This Item
          </Button>
        )}
        
        {/* Contact and save options for non-sold items */}
        {!isSold && (
          <div className="flex items-center gap-2">
            <Button 
              className="flex-1"
              onClick={onContactClick}
              disabled={listing.sellerId === user?.id}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact Seller
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button 
                      variant={isSaved ? "default" : "outline"} 
                      size="icon"
                      onClick={handleToggleSave}
                      disabled={savingState || listing.sellerId === user?.id}
                    >
                      {savingState ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                      )}
                      <span className="sr-only">Save Listing</span>
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isSaved ? "Remove from saved" : "Save for later"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="sr-only">Share Listing</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share this listing</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        
        {/* "Make an offer" button for eligible listings */}
        {!isAuction && listing.allowBestOffer && !isSold && listing.sellerId !== user?.id && user && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setActiveTab("offers")}
          >
            Make an Offer
          </Button>
        )}
        
        {!user && !isSold && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate("/login", { state: { redirect: window.location.pathname } })}
          >
            Log in to {isAuction ? "Place a Bid" : "Make an Offer"}
          </Button>
        )}
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Views: {listing.views}</span>
          <span>
            {isAuction ? `Bids: ${listing.bidCount || 0}` : `Saves: ${listing.saves}`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
