import { useNavigate } from "react-router-dom";
import { copyListingUrl } from "@/utils/clipboardUtils";

export const useListingActions = () => {
  const navigate = useNavigate();

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

  return {
    handleEdit,
    handleReviewOffers,
    handleShare,
    handleChangeToAuction,
  };
};