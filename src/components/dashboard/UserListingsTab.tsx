import { useState } from "react";
import { Loading } from "@/components/ui/loading";
import { EndListingDialog } from "@/components/listings/EndListingDialog";
import { useEndListing } from "@/hooks/listings/useEndListing";
import { SoldItemsList } from "@/components/listings/sold-items/SoldItemsList";
import { useSoldItems } from "@/components/listings/sold-items/useSoldItems";
import { useUserListings, TabType } from "@/hooks/dashboard/useUserListings";
import { useListingActions } from "@/hooks/dashboard/useListingActions";
import { ListingsTabs } from "./tabs/ListingsTabs";
import { EmptyListingsState } from "./tabs/EmptyListingsState";
import { ListingsGrid } from "./tabs/ListingsGrid";

interface UserListingsTabProps {
  userId: string;
}

export const UserListingsTab = ({ userId }: UserListingsTabProps) => {
  const [tab, setTab] = useState<TabType>("active");
  const [endingItem, setEndingItem] = useState<any>(null);
  const [relistingItem, setRelistingItem] = useState<any>(null);
  
  const { isEnding, endListing } = useEndListing(endingItem?.id);
  const { listings, isLoading } = useUserListings(userId, tab, isEnding);
  const { soldItems, isLoading: isSoldLoading } = useSoldItems(userId, relistingItem);
  
  const {
    handleEdit,
    handleReviewOffers,
    handleShare,
    handleChangeToAuction,
  } = useListingActions();

  const handleEnd = (listing: any) => {
    setEndingItem(listing);
  };

  const handleRelistClick = (item: any) => {
    setRelistingItem(item);
  };

  return (
    <div>
      <ListingsTabs activeTab={tab} onTabChange={setTab} />

      {tab === "sold" ? (
        <SoldItemsList
          soldItems={soldItems}
          isLoading={isSoldLoading}
          onRelistClick={handleRelistClick}
        />
      ) : isLoading ? (
        <Loading message="Loading your listings..." />
      ) : listings.length === 0 ? (
        <EmptyListingsState />
      ) : (
        <ListingsGrid
          listings={listings}
          onEdit={handleEdit}
          onEnd={handleEnd}
          onReviewOffers={handleReviewOffers}
          onShare={handleShare}
          onChangeToAuction={handleChangeToAuction}
          isEnding={isEnding}
        />
      )}

      {endingItem && (
        <EndListingDialog
          open={!!endingItem}
          onOpenChange={(open) => !open && setEndingItem(null)}
          onEnd={endListing}
          listingTitle={endingItem.title}
          isEnding={isEnding}
        />
      )}
    </div>
  );
};

export default UserListingsTab;