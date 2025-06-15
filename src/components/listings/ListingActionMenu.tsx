
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Share, Edit } from "lucide-react";
import { getEffectiveListingStatus, canEndListing } from "@/utils/listingStatus";

interface ListingActionMenuProps {
  status: string; // Now using the *effective status*!
  type: string;
  allowBestOffer: boolean;
  onEdit?: () => void;
  onReviewOffers?: () => void;
  onShare?: () => void;
  onChangeToAuction?: () => void;
  onEnd?: () => void;
  disableEnd?: boolean;
}

export function ListingActionMenu({
  status,
  type,
  allowBestOffer,
  onEdit,
  onReviewOffers,
  onShare,
  onChangeToAuction,
  onEnd,
  disableEnd = false,
}: ListingActionMenuProps) {
  // Now, status is the effective status!
  const showEnd = canEndListing({ status: status, expiresAt: new Date(0) }); // expiresAt not used by canEndListing now
  const showEdit = status === "active";
  const showReviewOffers = allowBestOffer;
  const showChangeToAuction = type.toLowerCase() === "classified";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 p-0 absolute top-2 left-2 z-10 bg-background/90 shadow"
          tabIndex={0}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="sr-only">Open listing actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="z-50 bg-background shadow-lg min-w-[190px]"
      >
        {showEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Listing
          </DropdownMenuItem>
        )}
        {showReviewOffers && (
          <DropdownMenuItem onClick={onReviewOffers}>
            Review Offers
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onShare}>
          <Share className="mr-2 h-4 w-4" />
          Share Listing
        </DropdownMenuItem>
        {showChangeToAuction && (
          <DropdownMenuItem onClick={onChangeToAuction}>
            Change to Auction
          </DropdownMenuItem>
        )}
        {showEnd && (
          <DropdownMenuItem onClick={onEnd} disabled={disableEnd}>
            End Listing
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
