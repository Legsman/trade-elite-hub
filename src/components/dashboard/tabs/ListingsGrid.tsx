import { SellerListingCard } from "../SellerListingCard";

interface ListingsGridProps {
  listings: any[];
  onEdit: (listing: any) => void;
  onEnd: (listing: any) => void;
  onReviewOffers: (listing: any) => void;
  onShare: (listing: any) => void;
  onChangeToAuction: (listing: any) => void;
  onRelist: (listing: any) => void;
  isEnding: boolean;
}

export const ListingsGrid = ({
  listings,
  onEdit,
  onEnd,
  onReviewOffers,
  onShare,
  onChangeToAuction,
  onRelist,
  isEnding,
}: ListingsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {listings.map((listing) => (
        <SellerListingCard
          key={listing.id}
          listing={listing}
          onEdit={() => onEdit(listing)}
          onEnd={() => onEnd(listing)}
          onReviewOffers={
            listing.allowBestOffer
              ? () => onReviewOffers(listing)
              : undefined
          }
          onShare={() => onShare(listing)}
          onChangeToAuction={
            listing.type === "classified"
              ? () => onChangeToAuction(listing)
              : undefined
          }
          onRelist={() => onRelist(listing)}
          disableEnd={isEnding}
        />
      ))}
    </div>
  );
};