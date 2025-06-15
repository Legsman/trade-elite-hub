import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listings/ListingCard";
import { EndListingDialog } from "@/components/listings/EndListingDialog";
import { useEndListing } from "@/hooks/listings/useEndListing";

interface UserListingsTabProps {
  userId: string;
}

export const UserListingsTab = ({ userId }: UserListingsTabProps) => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for End Listing dialog
  const [endingItem, setEndingItem] = useState<any>(null);
  const { isEnding, endListing } = useEndListing(endingItem?.id);

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("listings")
          .select("*")
          .eq("seller_id", userId)
          .eq("status", "active")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const transformedListings = data.map(listing => ({
          ...listing,
          expiresAt: new Date(listing.expires_at),
          createdAt: new Date(listing.created_at),
          updatedAt: new Date(listing.updated_at)
        }));

        setListings(transformedListings);
      } catch (error) {
        console.error("Error fetching user listings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [userId, isEnding]);

  if (isLoading) {
    return <Loading message="Loading your listings..." />;
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <h3 className="text-lg font-medium mb-2">No active listings yet</h3>
        <p className="text-sm">Create a listing to sell your items.</p>
        <Button variant="link" className="mt-4" onClick={() => navigate("/listings/create")}>
          Create Listing
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {listings.map((listing) => (
          <div key={listing.id} className="relative">
            <ListingCard listing={listing} />
            <div className="absolute top-2 left-2 z-10 flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/listings/${listing.id}/edit`)}
              >
                Revise
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setEndingItem(listing)}
                disabled={isEnding}
              >
                End
              </Button>
            </div>
          </div>
        ))}
      </div>

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
