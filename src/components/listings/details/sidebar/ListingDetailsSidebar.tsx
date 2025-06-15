
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
import { ShippingInfoCard } from "./ShippingInfoCard";
import { PriceCard } from "./PriceCard";
import { SafetyTipsCard } from "./SafetyTipsCard";
import { SellerInfoCard } from "./SellerInfoCard";

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
  
  const adaptedUserBidStatus = {
    ...userBidStatus,
    userHighestBid: userBidStatus.userBid ? Number(userBidStatus.userBid.maximum_bid) : 0,
    userMaximumBid: userBidStatus.userBid && userBidStatus.userBid.maximum_bid ? 
      Number(userBidStatus.userBid.maximum_bid) : 0
  };

  return (
    <>
      <PriceCard
        listing={listing}
        user={user}
        isSaved={isSaved}
        savingState={savingState}
        isOwner={isOwner}
        handleToggleSave={handleToggleSave}
        handleShare={handleShare}
        onContactClick={onContactClick}
        onRelistClick={onRelistClick}
        setActiveTab={setActiveTab}
        navigate={navigate}
        currentPrice={displayPrice}
        highestBid={highestBid}
        bids={bids}
        isAuction={isAuction}
        isSold={isSold}
        placeBid={handlePlaceBid}
        adaptedUserBidStatus={adaptedUserBidStatus}
      />
      {/* Seller information */}
      {seller && (
        <SellerInfoCard seller={seller} navigate={navigate} />
      )}
      <SafetyTipsCard />
      <ShippingInfoCard />
    </>
  );
};

