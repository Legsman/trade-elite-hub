
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface CompletedListingsFilterProps {
  showCompleted: boolean;
  onShowCompletedChange: (checked: boolean) => void;
}

export const CompletedListingsFilter: React.FC<CompletedListingsFilterProps> = ({
  showCompleted,
  onShowCompletedChange,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="showCompletedCheckbox"
        checked={showCompleted}
        onCheckedChange={onShowCompletedChange}
      />
      <Label htmlFor="showCompletedCheckbox">Show Completed Listings</Label>
    </div>
  );
};
