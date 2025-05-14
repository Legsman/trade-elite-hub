
import { useBids } from "@/hooks/listings";
import { Listing, User as UserType } from "@/types";
import { NavigateFunction } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { PriceCard } from "./PriceCard";
import { SellerInfoCard } from "./SellerInfoCard";
import { SafetyTipsCard } from "./SafetyTipsCard";

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
  setActiveTab
}: ListingDetailsSidebarProps) => {
  const isAuction = listing.type === "auction";
  const { highestBid, bids, placeBid, getUserBidStatus } = useBids({ listingId: listing.id });
  
  // Updated to use camelCase property currentBid instead of current_bid
  const displayPrice = isAuction 
    ? listing.currentBid || highestBid || listing.price 
    : listing.price;

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
    userHighestBid: userBidStatus.userBid ? Number(userBidStatus.userBid.amount) : 0,
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
        navigate={navigate}
        setActiveTab={setActiveTab}
        displayPrice={displayPrice}
        highestBid={highestBid}
        handlePlaceBid={handlePlaceBid}
        userBidStatus={adaptedUserBidStatus}
      />
      
      {seller && (
        <SellerInfoCard seller={seller} navigate={navigate} />
      )}
      
      <SafetyTipsCard />
    </>
  );
};
