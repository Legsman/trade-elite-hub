import { Loader2, Heart, Share2, MessageSquare, MapPin, Shield, User, Star, ThumbsUp, Gavel } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ListingCountdown, CollapsibleBidForm } from "@/components/listings";
import { useBids } from "@/hooks/listings";
import { Listing } from "@/types";
import { User as UserType } from "@/types";
import { NavigateFunction } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { ShippingInfoCard } from "./ShippingInfoCard"; // <-- ADD THIS IMPORT

interface ListingDetailsSidebarProps {
  listing: Listing;
  seller: any;  // Using any for now since the seller type isn't explicitly defined
  user?: UserType;
  isSaved: boolean;
  savingState: boolean;
  isOwner: boolean;
  handleToggleSave: () => Promise<void>;
  handleShare: () => void;
  onContactClick: () => void;
  onRelistClick: () => void;
  navigate: NavigateFunction;
  setActiveTab: (tab: string) => void;
  refetchListing: () => Promise<void>; // Added this line!
}

export const ListingDetailsSidebar = ({
  listing,
  seller,
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
  refetchListing // Added this line!
}: ListingDetailsSidebarProps) => {
  const isAuction = listing.type === "auction";
  const isSold = listing.status === "sold";
  const { highestBid, bids, placeBid, getUserBidStatus } = useBids({ listingId: listing.id });
  
  // Updated to use camelCase property currentBid instead of current_bid
  const displayPrice = isAuction 
    ? listing.currentBid || highestBid || listing.price 
    : listing.price;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  // Handle placing a bid
  const handlePlaceBid = async (amount: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to place a bid",
        variant: "destructive",
      });
      return { success: false };
    }
    
    return await placeBid(amount);
  };

  // Get user bid status and convert to the format expected by CollapsibleBidForm
  const userBidStatus = getUserBidStatus();

  // --- FIX: set userHighestBid to use maximum_bid, NOT amount ---
  const adaptedUserBidStatus = {
    ...userBidStatus,
    userHighestBid: userBidStatus.userBid ? Number(userBidStatus.userBid.maximum_bid) : 0,
    userMaximumBid: userBidStatus.userBid && userBidStatus.userBid.maximum_bid ? 
      Number(userBidStatus.userBid.maximum_bid) : 0
  };

  return (
    <>
      {/* Price card */}
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
                userBidStatus={adaptedUserBidStatus}
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
              {isAuction ? `Bids: ${bids.length}` : `Saves: ${listing.saves}`}
            </span>
          </div>
        </CardContent>
      </Card>
      
      {/* Seller information */}
      {seller && (
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
                    alt={seller.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <div className="font-medium flex items-center">
                  {seller.name}
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
                <span className="font-medium">{seller.rating}</span>
                <span className="text-sm text-muted-foreground ml-1">
                  ({seller.salesCount} sales)
                </span>
              </div>
              <Button variant="link" size="sm" className="p-0" onClick={() => navigate(`/profile/${seller.id}`)}>
                View Profile
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
            
            <Button 
              className="w-full" 
              variant="outline" 
              onClick={() => navigate(`/feedback/new?user=${seller.id}`)}
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              Leave Feedback
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Safety tips */}
      <Card>
        <CardHeader>
          <CardTitle>Safety Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-2">
            <li className="flex items-start">
              <Shield className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <span>Meet in public places for viewings or exchanges</span>
            </li>
            <li className="flex items-start">
              <Shield className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <span>Use our secure messaging system for all communications</span>
            </li>
            <li className="flex items-start">
              <Shield className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <span>Verify high-value items with an expert before purchase</span>
            </li>
            <li className="flex items-start">
              <Shield className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <span>Report suspicious listings or behavior to our team</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* NEW: Shipping Information Card */}
      <ShippingInfoCard />
    </>
  );
};
