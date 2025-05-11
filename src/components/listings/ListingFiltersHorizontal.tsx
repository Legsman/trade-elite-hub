
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  SearchBar,
  CategoryButtons,
  ListingTypeFilter,
  LocationFilter,
  ConditionFilter,
  PriceRangeFilter,
  BestOfferFilter,
  SortByFilter,
  CompletedListingsFilter
} from "./filters";

interface ListingFiltersHorizontalProps {
  category: string;
  type: string;
  location: string;
  condition: string;
  priceRange: number[];
  sortBy: string;
  allowBestOffer: boolean;
  searchTerm: string;
  showCompleted: boolean;
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
  onShowCompletedChange: (checked: boolean) => void;
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
  showCompleted,
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
  onShowCompletedChange,
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
    allowBestOffer ||
    showCompleted;

  return (
    <Card className="p-4 mb-6 bg-background">
      <div className="space-y-4">
        {/* Search and category row */}
        <div className="flex flex-col md:flex-row gap-4">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            onSearchSubmit={onSearchSubmit}
          />
          
          <CategoryButtons
            category={category}
            onCategoryChange={onCategoryChange}
          />
        </div>
        
        {/* Filters row */}
        <div className="flex flex-wrap gap-4">
          <ListingTypeFilter 
            type={type} 
            onTypeChange={onTypeChange} 
          />

          <LocationFilter
            location={location}
            onLocationChange={onLocationChange}
          />

          <ConditionFilter
            condition={condition}
            onConditionChange={onConditionChange}
          />

          <PriceRangeFilter
            priceRange={priceRange}
            onPriceChange={onPriceChange}
            onPriceApply={onPriceApply}
          />

          <BestOfferFilter
            allowBestOffer={allowBestOffer}
            onAllowBestOfferChange={onAllowBestOfferChange}
          />

          <SortByFilter
            sortBy={sortBy}
            onSortChange={onSortChange}
          />
        </div>

        {/* Completed listings filter */}
        <div className="flex items-center">
          <CompletedListingsFilter
            showCompleted={showCompleted}
            onShowCompletedChange={onShowCompletedChange}
          />
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
