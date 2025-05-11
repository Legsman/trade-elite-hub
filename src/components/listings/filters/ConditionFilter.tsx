
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ConditionFilterProps {
  condition: string;
  onConditionChange: (value: string) => void;
}

export const ConditionFilter: React.FC<ConditionFilterProps> = ({
  condition,
  onConditionChange,
}) => {
  return (
    <Select value={condition} onValueChange={onConditionChange}>
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder="Condition" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all_conditions">All Conditions</SelectItem>
        <SelectItem value="new">New</SelectItem>
        <SelectItem value="used">Used</SelectItem>
        <SelectItem value="like_new">Like New</SelectItem>
        <SelectItem value="fair">Fair</SelectItem>
      </SelectContent>
    </Select>
  );
};
