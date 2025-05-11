
import { AlertCircle, Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ListingDetailSoldAlertProps {
  isAuction?: boolean;
  soldDate?: Date;
}

export const ListingDetailSoldAlert = ({ 
  isAuction = false, 
  soldDate
}: ListingDetailSoldAlertProps) => {
  const formattedDate = soldDate ? 
    new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(soldDate) : 
    null;

  return (
    <Alert variant="default" className="bg-green-50 border-green-200 mb-6">
      <Check className="h-5 w-5 text-green-600" />
      <AlertTitle className="text-green-800 font-medium">
        This item has been sold
      </AlertTitle>
      <AlertDescription className="text-green-700">
        {isAuction ? 
          "This auction has ended and the item has been sold to the highest bidder." :
          "This listing has been sold and is no longer available for purchase."
        }
        {formattedDate && (
          <div className="mt-1 text-sm">
            Sold on {formattedDate}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};
