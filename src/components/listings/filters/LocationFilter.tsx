
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LocationFilterProps {
  location: string;
  onLocationChange: (value: string) => void;
}

export const LocationFilter: React.FC<LocationFilterProps> = ({
  location,
  onLocationChange,
}) => {
  return (
    <Select value={location} onValueChange={onLocationChange}>
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder="Location" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all_locations">All Locations</SelectItem>
        <SelectItem value="london">London</SelectItem>
        <SelectItem value="manchester">Manchester</SelectItem>
        <SelectItem value="birmingham">Birmingham</SelectItem>
        <SelectItem value="glasgow">Glasgow</SelectItem>
        <SelectItem value="cardiff">Cardiff</SelectItem>
      </SelectContent>
    </Select>
  );
};
