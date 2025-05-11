
import React, { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface ListingFiltersHorizontalProps {
  category: string;
  type: string;
  location: string;
  condition: string;
  priceRange: number[];
  sortBy: string;
  allowBestOffer: boolean;
  searchTerm: string;
  onCategoryChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onConditionChange: (value: string) => void;
  onPriceChange: (value: number[]) => void;
  onPriceApply: () => void;
  onSortChange: (value: string) => void;
  onAllowBestOfferChange: (checked: boolean) => void;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearFilters: () => void;
}

export const ListingFiltersHorizontal: React.FC<ListingFiltersHorizontalProps> = ({
  category,
  type,
  location,
  condition,
  priceRange,
  sortBy,
  allowBestOffer,
  searchTerm,
  onCategoryChange,
  onTypeChange,
  onLocationChange,
  onConditionChange,
  onPriceChange,
  onPriceApply,
  onSortChange,
  onAllowBestOfferChange,
  onSearchChange,
  onSearchSubmit,
  onClearFilters,
}) => {
  const hasActiveFilters = 
    category !== "all_categories" || 
    type !== "all_types" || 
    location !== "all_locations" || 
    condition !== "all_conditions" || 
    priceRange[0] > 0 || 
    priceRange[1] < 10000 ||
    searchTerm !== "" ||
    sortBy !== "newest" ||
    allowBestOffer;

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  return (
    <Card className="p-4 mb-6 bg-background">
      <div className="space-y-4">
        {/* Search and category row */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search listings..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant={category === "all_categories" ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange("all_categories")}
            >
              All Categories
            </Button>
            {["electronics", "clothing", "furniture", "books", "sports"].map((cat) => (
              <Button
                key={cat}
                variant={category === cat ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Filters row */}
        <div className="flex flex-wrap gap-4">
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

          {/* Price range popover */}
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

          {/* Best offer filter */}
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

          {/* Sort by */}
          <Select value={sortBy} onValueChange={onSortChange} className="ml-auto">
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ListingFiltersHorizontal;
