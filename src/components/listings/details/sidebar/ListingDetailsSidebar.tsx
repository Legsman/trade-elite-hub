
import { useBids } from "@/hooks/listings";
import { Listing, User as UserType } from "@/types";
import { NavigateFunction } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { PriceCard } from "./PriceCard";
import { SellerInfoCard } from "./SellerInfoCard";
import { SafetyTipsCard } from "./SafetyTipsCard";
import { ShippingInfoCard } from "./ShippingInfoCard"; // <-- Import ShippingInfoCard

interface ListingDetailsSidebarProps {
  listing: Listing;
  seller: any;
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
  refetchListing: () => Promise<void>;
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
  refetchListing,
}: ListingDetailsSidebarProps) => {
  const isAuction = listing.type === "auction";
  const { highestBid, bids, placeBid, getUserBidStatus, fetchBids } = useBids({ listingId: listing.id });
  
  const displayPrice = isAuction 
    ? listing.currentBid || highestBid || listing.price 
    : listing.price;

  const handlePlaceBid = async (amount: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to place a bid",
        variant: "destructive",
      });
      return { success: false };
    }
    
    const result = await placeBid(amount);
    if (result.success) {
      console.log("Bid placed successfully, refreshing data...");
      try {
        await Promise.all([
          refetchListing(),
          fetchBids()
        ]);
        console.log("Data refreshed successfully after bid");
      } catch (err) {
        console.error("Error refreshing data after bid:", err);
      }
    } else {
      console.error("Bid placement failed:", result.error);
    }
    return result;
  };

  const userBidStatus = getUserBidStatus();
  const adaptedUserBidStatus = {
    ...userBidStatus,
    userHighestBid: userBidStatus.userBid ? Number(userBidStatus.userBid.amount) : 0,
    userMaximumBid: userBidStatus.userBid && userBidStatus.userBid.maximum_bid ? 
      Number(userBidStatus.userBid.maximum_bid) : 0
  };

  const enhancedListing = {
    ...listing,
    bidCount: listing.bidCount !== undefined ? listing.bidCount : bids.length
  };

  return (
    <>
      <PriceCard
        listing={enhancedListing}
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

      {/* Render ShippingInfoCard beneath SafetyTipsCard */}
      <ShippingInfoCard />
    </>
  );
};
