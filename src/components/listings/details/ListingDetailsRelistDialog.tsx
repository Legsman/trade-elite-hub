
import { RelistForm } from "@/components/listings";
import { useRelistListing } from "@/hooks/listings/useRelistListing";
import { useNavigate } from "react-router-dom";
import { Listing } from "@/types";

interface ListingDetailsRelistDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  listing: Listing;
}

export const ListingDetailsRelistDialog = ({
  open,
  setOpen,
  listing
}: ListingDetailsRelistDialogProps) => {
  const navigate = useNavigate();
  const { relistListing } = useRelistListing(listing.id);

  const handleRelistSubmit = async (data: any) => {
    const result = await relistListing(data);
    if (result.success && result.newListingId) {
      setOpen(false);
      // Navigate to the new listing
      navigate(`/listings/${result.newListingId}`);
    }
    return result.success;
  };

  return (
    <RelistForm
      open={open}
      onOpenChange={setOpen}
      onRelist={handleRelistSubmit}
      listingTitle={listing.title}
    />
  );
};
