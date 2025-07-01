import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { EndListingDialog } from "@/components/listings/EndListingDialog";
import { useEndListing } from "@/hooks/listings/useEndListing";
import { SellerListingCard } from "./SellerListingCard";
import { SoldItemsList } from "@/components/listings/sold-items/SoldItemsList";
import { useSoldItems } from "@/components/listings/sold-items/useSoldItems";

// Clipboard share util
async function copyListingUrl(listingId: string) {
  try {
    const url = `${window.location.origin}/listings/${listingId}`;
    await navigator.clipboard.writeText(url);
    // Small feedback, but ideally would use a toast
    window.alert("Listing URL copied to clipboard!");
  } catch {
    window.alert("Failed to copy URL");
  }
}

type TabType = "active" | "ended" | "sold" | "all";

interface UserListingsTabProps {
  userId: string;
}

export const UserListingsTab = ({ userId }: UserListingsTabProps) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabType>("active");
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [endingItem, setEndingItem] = useState<any>(null);
  const { isEnding, endListing } = useEndListing(endingItem?.id);

  // For relisting - forward compatible with SoldItemsList flow
  const [relistingItem, setRelistingItem] = useState<any>(null);
  // If re-using a relisting hook, adapt as needed

  // For advanced sold items integration
  const {
    soldItems,
    isLoading: isSoldLoading,
  } = useSoldItems(userId, relistingItem);

  useEffect(() => {
    if (tab === "sold") return; // Don't fetch here, handled in useSoldItems
    const fetchListings = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from("listings")
          .select("*")
          .eq("seller_id", userId)
          .order("created_at", { ascending: false });

        // Tab filtering (fully correct now that we have explicit sale status and info)
        if (tab === "active") {
          // Show only active non-ended/sold
          query = query.eq("status", "active");
        }
        if (tab === "ended") {
          // Ended/expired and not sold
          query = query.in("status", ["ended", "expired"]).or(`(status.eq.active,and(expires_at.lt.${new Date().toISOString()},sale_buyer_id.is.null))`);
        }
        if (tab === ("sold" as TabType)) {
          query = query.eq("status", "sold");
        }
        // "all" shows all

        const { data, error } = await query;

        if (error) throw error;

        // Convert date strings to Date and add new sale fields
        const transformedListings = data.map((listing) => ({
          ...listing,
          expiresAt: new Date(listing.expires_at),
          createdAt: new Date(listing.created_at),
          updatedAt: new Date(listing.updated_at),
          saleDate: listing.sale_date ? new Date(listing.sale_date) : undefined,
          saleAmount: listing.sale_amount ?? undefined,
          saleBuyerId: listing.sale_buyer_id ?? undefined,
        }));

        setListings(transformedListings);
      } catch (error) {
        console.error("Error fetching user listings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [userId, tab, isEnding]);

  // Handlers for each action
  const handleEdit = (listing: any) => {
    // FIXED: use correct edit route!
    window.location.href = `/listings/${listing.id}/edit`;
  };
  const handleReviewOffers = (listing: any) => {
    navigate(`/listings/${listing.id}/offers`);
  };
  const handleShare = (listing: any) => {
    copyListingUrl(listing.id);
  };
  const handleChangeToAuction = (listing: any) => {
    navigate(`/listings/${listing.id}/change-to-auction`);
  };
  const handleEnd = (listing: any) => {
    setEndingItem(listing);
  };

  // For sold items: handle relist click (can be forward compatible)
  const handleRelistClick = (item: any) => {
    setRelistingItem(item);
  };

  let tabOptions: { value: TabType; label: string }[] = [
    { value: "active", label: "Active" },
    { value: "ended", label: "Ended" },
    { value: "sold", label: "Sold" },
    { value: "all", label: "All" },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabOptions.map((t) => (
          <Button
            key={t.value}
            variant={t.value === tab ? "default" : "outline"}
            size="sm"
            onClick={() => setTab(t.value)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {/* SOLD TAB - use SoldItemsList for feedback */}
      {tab === "sold" ? (
        <SoldItemsList
          soldItems={soldItems}
          isLoading={isSoldLoading}
          onRelistClick={handleRelistClick}
        />
      ) : isLoading ? (
        <Loading message="Loading your listings..." />
      ) : listings.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <h3 className="text-lg font-medium mb-2">No listings found</h3>
          <p className="text-sm">Create a listing to sell your items.</p>
          <Button
            variant="link"
            className="mt-4"
            onClick={() => navigate("/listings/create")}
          >
            Create Listing
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {listings.map((listing) => (
            <SellerListingCard
              key={listing.id}
              listing={listing}
              onEdit={() => handleEdit(listing)}
              onEnd={() => handleEnd(listing)}
              onReviewOffers={
                listing.allowBestOffer
                  ? () => handleReviewOffers(listing)
                  : undefined
              }
              onShare={() => handleShare(listing)}
              onChangeToAuction={
                listing.type === "classified"
                  ? () => handleChangeToAuction(listing)
                  : undefined
              }
              disableEnd={isEnding}
            />
          ))}
        </div>
      )}

      {/* End Listing Dialog */}
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