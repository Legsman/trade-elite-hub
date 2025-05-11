
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ListingTypeFilterProps {
  type: string;
  onTypeChange: (value: string) => void;
}

export const ListingTypeFilter: React.FC<ListingTypeFilterProps> = ({
  type,
  onTypeChange,
}) => {
  return (
    <Select value={type} onValueChange={onTypeChange}>
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder="Listing Type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all_types">All Types</SelectItem>
        <SelectItem value="auction">Auction</SelectItem>
        <SelectItem value="sale">For Sale</SelectItem>
      </SelectContent>
    </Select>
  );
};
