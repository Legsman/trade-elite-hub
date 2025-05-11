
import React from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface PriceRangeFilterProps {
  priceRange: number[];
  onPriceChange: (value: number[]) => void;
  onPriceApply: () => void;
}

export const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  priceRange,
  onPriceChange,
  onPriceApply,
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[160px]">
          Price Range
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Price Range (£)</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm">{priceRange[0]}</span>
            <span className="text-sm">{priceRange[1]}</span>
          </div>
          <Slider
            min={0}
            max={10000}
            step={100}
            value={priceRange}
            onValueChange={onPriceChange}
          />
          <Button onClick={onPriceApply} className="w-full">Apply</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
