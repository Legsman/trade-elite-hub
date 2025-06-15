
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { EndListingDialog } from "@/components/listings/EndListingDialog";
import { useEndListing } from "@/hooks/listings/useEndListing";
import { SellerListingCard } from "./SellerListingCard";

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

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from("listings")
          .select("*")
          .eq("seller_id", userId)
          .order("created_at", { ascending: false });

        // Filter by tab
        if (tab === "active") query = query.eq("status", "active");
        if (tab === "ended") query = query.in("status", ["ended", "expired"]);
        if (tab === "sold") query = query.eq("status", "sold");
        // "all" shows all

        const { data, error } = await query;

        if (error) throw error;

        // Convert date strings to Date
        const transformedListings = data.map(listing => ({
          ...listing,
          expiresAt: new Date(listing.expires_at),
          createdAt: new Date(listing.created_at),
          updatedAt: new Date(listing.updated_at),
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

  // Dummy implementations for stats, relist, feedback; replace with real handlers
  const handleViewStats = (listing: any) => {
    navigate(`/listings/${listing.id}/stats`);
  };
  const handleRelist = (listing: any) => {
    navigate(`/listings/${listing.id}/relist`);
  };
  const handleLeaveFeedback = (listing: any) => {
    navigate(`/listings/${listing.id}/feedback`);
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

      {isLoading ? (
        <Loading message="Loading your listings..." />
      ) : listings.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <h3 className="text-lg font-medium mb-2">No listings found</h3>
          <p className="text-sm">Create a listing to sell your items.</p>
          <Button variant="link" className="mt-4" onClick={() => navigate("/listings/create")}>
            Create Listing
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {listings.map((listing) => (
            <SellerListingCard
              key={listing.id}
              listing={listing}
              onRevise={() => navigate(`/listings/${listing.id}/edit`)}
              onEnd={() => setEndingItem(listing)}
              onRelist={() => handleRelist(listing)}
              onViewStats={() => handleViewStats(listing)}
              onLeaveFeedback={() => handleLeaveFeedback(listing)}
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
