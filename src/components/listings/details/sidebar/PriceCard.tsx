import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Loader2, Heart, Share2, MessageSquare, Gavel, MapPin } from "lucide-react";
import { ListingCountdown, CollapsibleBidForm } from "@/components/listings";
import { Listing } from "@/types";
import { User as UserType } from "@/types";

interface PriceCardProps {
  listing: Listing;
  user?: UserType;
  isSaved: boolean;
  savingState: boolean;
  isOwner: boolean;
  handleToggleSave: () => Promise<void>;
  handleShare: () => void;
  onContactClick: () => void;
  onRelistClick: () => void;
  setActiveTab: (tab: string) => void;
  navigate: (url: string, options?: any) => void;
  currentPrice: number;
  highestBid: number | undefined;
  bids: any[];
  isAuction: boolean;
  isSold: boolean;
  placeBid: (amount: number) => Promise<any>;
  adaptedUserBidStatus: any;
}

export const PriceCard = ({
  listing, user, isSaved, savingState, isOwner,
  handleToggleSave, handleShare, onContactClick, onRelistClick, setActiveTab,
  navigate,
  currentPrice, highestBid, bids, isAuction, isSold,
  placeBid, adaptedUserBidStatus
}: PriceCardProps) => (
  <Card className={isSold ? "border-green-500" : ""}>
    <CardHeader>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{listing.title}</h1>
          <div className="flex items-center mt-1 text-muted-foreground text-sm">
            {/* Keep using location and icon */}
            <span className="mr-1"><MapPin className="h-3.5 w-3.5" /></span>
            {listing.location}
          </div>
        </div>
        <Badge variant={isSold ? "success" : isAuction ? "secondary" : "outline"}>
          {isSold ? "Sold" : isAuction ? "Auction" : "For Sale"}
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Show price/bid UI */}
      {isSold ? (
        <div className="flex items-baseline">
          <span className="text-lg font-medium text-muted-foreground mr-2">Sold for:</span>
          <span className="text-3xl font-bold text-green-600">
            £{(listing.saleAmount || listing.price).toLocaleString()}
          </span>
        </div>
      ) : isAuction ? (
        // Only show bid form for non-sellers
        listing.sellerId !== user?.id && user && !isSold ? (
          <CollapsibleBidForm
            listingId={listing.id}
            currentPrice={currentPrice}
            highestBid={highestBid}
            onPlaceBid={placeBid}
            userBidStatus={adaptedUserBidStatus}
            expiryDate={listing.expiresAt}
          />
        ) : listing.sellerId === user?.id ? (
          // Message for sellers
          <div className="p-4 bg-muted/50 rounded-md text-center">
            <p className="text-sm text-muted-foreground">
              This is your auction. You cannot bid on your own listing.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {currentPrice ? (
              <div className="flex items-baseline">
                <div className="flex items-center">
                  <Gavel className="h-4 w-4 mr-1 text-purple" />
                  <span className="text-sm text-muted-foreground">Current bid:</span>
                </div>
                <span className="text-3xl font-bold text-purple ml-2">£{currentPrice.toLocaleString()}</span>
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
      {/* Countdown for unsold */}
      {!isSold ? (
        <ListingCountdown 
          expiryDate={listing.expiresAt} 
          isAuction={isAuction}
          listingStatus={listing.status}
        />
      ) : (
        <p className="text-sm text-muted-foreground">This item is no longer available</p>
      )}
      {/* Seller can relist */}
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
      {/* Contact/save/share for unsold */}
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
      {/* "Make an offer" logic - allow for auctions only if no bids */}
      {listing.allowBestOffer && !isSold && listing.sellerId !== user?.id && user && (!isAuction || bids.length === 0) && (
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => setActiveTab("offers")}
        >
          Make an Offer
        </Button>
      )}
      {/* Log in prompt for non-logged-in */}
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
          {isAuction ? `Bids: ${bids.length}` : `Saves: ${listing.saves}`}
        </span>
      </div>
    </CardContent>
  </Card>
);
