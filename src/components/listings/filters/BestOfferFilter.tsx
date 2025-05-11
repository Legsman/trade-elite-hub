
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface BestOfferFilterProps {
  allowBestOffer: boolean;
  onAllowBestOfferChange: (checked: boolean) => void;
}

export const BestOfferFilter: React.FC<BestOfferFilterProps> = ({
  allowBestOffer,
  onAllowBestOfferChange,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox 
        id="allowBestOffer"
        checked={allowBestOffer}
        onCheckedChange={onAllowBestOfferChange}
      />
      <Label htmlFor="allowBestOffer" className="text-sm">
        Best Offers
      </Label>
    </div>
  );
};
