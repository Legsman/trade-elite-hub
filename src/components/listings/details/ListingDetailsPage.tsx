
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth";
import { useListing } from "@/hooks/listings";
import { useSellerProfile } from "@/hooks/use-user-profile";
import { useAnalytics } from "@/hooks/use-analytics";
import { Loading } from "@/components/ui/loading";
import { ListingDetailSoldAlert } from "@/components/listings";
import { ListingDetailsHeader } from './ListingDetailsHeader';
import { ListingDetailsMainContent } from './ListingDetailsMainContent';
import { ListingDetailsSidebar } from './sidebar/ListingDetailsSidebar';
import { ListingDetailsContactDialog } from './ListingDetailsContactDialog';
import { ListingDetailsRelistDialog } from './ListingDetailsRelistDialog';

export const ListingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    listing, 
    isLoading: listingLoading, 
    error: listingError, 
    toggleSave, 
    checkSaved,
    refetch: refetchListing 
  } = useListing(id);
  const { seller, isLoading: sellerLoading } = useSellerProfile(listing?.sellerId);
  const { trackEvent } = useAnalytics();
  
  const [isSaved, setIsSaved] = useState(false);
  const [savingState, setSavingState] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const [relistFormOpen, setRelistFormOpen] = useState(false);
  
  const isLoading = listingLoading || sellerLoading;

  // Check if the listing is saved
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (listing && user) {
        const savedStatus = await checkSaved();
        setIsSaved(savedStatus);
      }
    };
    
    checkSavedStatus();
  }, [listing, user, checkSaved]);

  // Track page view
  useEffect(() => {
    if (listing) {
      trackEvent("listing_view", { 
        listingId: listing.id,
        listingType: listing.type,
        listingCategory: listing.category,
        listingPrice: listing.price,
      });
    }
  }, [listing, trackEvent]);

  const handleToggleSave = async () => {
    if (!user) {
      return;
    }
    
    setSavingState(true);
    const result = await toggleSave();
    setSavingState(false);
    
    if (result.success) {
      setIsSaved(result.saved);
      trackEvent("listing_saved", { 
        listingId: listing?.id,
        saved: result.saved
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing?.title,
        text: `Check out this listing: ${listing?.title}`,
        url: window.location.href,
      }).then(() => {
        trackEvent("listing_shared", { listingId: listing?.id });
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast({
          title: "Link copied!",
          description: "The listing URL has been copied to your clipboard.",
        });
        trackEvent("listing_link_copied", { listingId: listing?.id });
      }).catch(console.error);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-12">
          <Loading message="Loading listing details..." />
        </div>
      </MainLayout>
    );
  }

  if (listingError || !listing) {
    return (
      <MainLayout>
        <div className="container py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Listing Not Found</h2>
          <p className="text-muted-foreground mb-6">The listing you are looking for does not exist or has been removed.</p>
          <Button onClick={() => navigate("/listings")}>Browse Listings</Button>
        </div>
      </MainLayout>
    );
  }

  const isAuction = listing.type === "auction";
  const isSold = listing.status === "sold";
  const isOwner = user?.id === listing.sellerId;

  return (
    <MainLayout>
      <div className="container py-8">
        <ListingDetailsHeader 
          navigate={navigate}
          listing={listing}
          isSold={isSold}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Images and details */}
          <div className="lg:col-span-2 space-y-6">
            <ListingDetailsMainContent 
              listing={listing}
              bids={[]} 
              isOwner={isOwner}
              userId={user?.id}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              refetchListing={refetchListing} // Pass refetchListing to child
            />
          </div>

          {/* Right column - Price and seller info */}
          <div className="space-y-6">
            <ListingDetailsSidebar 
              listing={listing}
              seller={seller}
              user={user}
              isSaved={isSaved}
              savingState={savingState}
              isOwner={isOwner}
              handleToggleSave={handleToggleSave}
              handleShare={handleShare}
              onContactClick={() => setMessageOpen(true)}
              onRelistClick={() => setRelistFormOpen(true)}
              navigate={navigate}
              setActiveTab={setActiveTab}
              refetchListing={refetchListing} // Pass refetchListing to sidebar
            />
          </div>
        </div>
      </div>

      {/* Contact seller dialog */}
      <ListingDetailsContactDialog
        open={messageOpen}
        setOpen={setMessageOpen}
        listing={listing}
        message={messageContent}
        setMessage={setMessageContent}
      />

      {/* Relist form dialog */}
      {isOwner && (
        <ListingDetailsRelistDialog
          open={relistFormOpen}
          setOpen={setRelistFormOpen}
          listing={listing}
        />
      )}
    </MainLayout>
  );
};

export default ListingDetailsPage;
