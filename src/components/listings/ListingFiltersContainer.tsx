
import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { ListingFiltersHorizontal } from "./ListingFiltersHorizontal";

interface ListingFiltersContainerProps {
  onClearFilters: () => void;
}

export const ListingFiltersContainer = ({ onClearFilters }: ListingFiltersContainerProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get query parameters
  const category = searchParams.get("category") || "all_categories";
  const type = searchParams.get("type") || "all_types";
  const location = searchParams.get("location") || "all_locations";
  const condition = searchParams.get("condition") || "all_conditions";
  const minPrice = searchParams.get("minPrice") || "0";
  const maxPrice = searchParams.get("maxPrice") || "10000";
  const sortBy = searchParams.get("sortBy") || "newest";
  const searchTerm = searchParams.get("search") || "";
  
  const [priceRange, setPriceRange] = useState<number[]>([
    parseInt(minPrice) || 0,
    parseInt(maxPrice) || 10000,
  ]);
  const [allowBestOffer, setAllowBestOffer] = useState(searchParams.get("allowBestOffer") === "true");
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  
  // Update URL parameters
  const updateParams = useCallback((newParams: Record<string, string | null>) => {
    const updatedParams = new URLSearchParams(searchParams);
    
    Object.keys(newParams).forEach((key) => {
      if (newParams[key] === null || newParams[key] === "" || 
          newParams[key] === "all_categories" || 
          newParams[key] === "all_types" || 
          newParams[key] === "all_locations" || 
          newParams[key] === "all_conditions") {
        updatedParams.delete(key);
      } else {
        updatedParams.set(key, newParams[key]!);
      }
    });
    
    setSearchParams(updatedParams);
  }, [searchParams, setSearchParams]);
  
  // Handle filter changes
  const handleCategoryChange = (value: string) => {
    updateParams({ category: value });
  };
  
  const handleTypeChange = (value: string) => {
    updateParams({ type: value });
  };
  
  const handleLocationChange = (value: string) => {
    updateParams({ location: value });
  };
  
  const handleConditionChange = (value: string) => {
    updateParams({ condition: value });
  };
  
  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
  };
  
  const handlePriceApply = () => {
    updateParams({
      minPrice: priceRange[0].toString(),
      maxPrice: priceRange[1].toString()
    });
  };
  
  const handleSortChange = (value: string) => {
    updateParams({ sortBy: value });
  };

  const handleAllowBestOfferChange = (checked: boolean) => {
    setAllowBestOffer(checked);
    updateParams({ allowBestOffer: checked ? "true" : null });
  };
  
  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value);
  };
  
  const handleSearchSubmit = () => {
    updateParams({ search: localSearchTerm, page: "1" });
  };
  
  return (
    <ListingFiltersHorizontal
      category={category}
      type={type}
      location={location}
      condition={condition}
      priceRange={priceRange}
      sortBy={sortBy}
      allowBestOffer={allowBestOffer}
      searchTerm={localSearchTerm}
      onCategoryChange={handleCategoryChange}
      onTypeChange={handleTypeChange}
      onLocationChange={handleLocationChange}
      onConditionChange={handleConditionChange}
      onPriceChange={handlePriceChange}
      onPriceApply={handlePriceApply}
      onSortChange={handleSortChange}
      onAllowBestOfferChange={handleAllowBestOfferChange}
      onSearchChange={handleSearchChange}
      onSearchSubmit={handleSearchSubmit}
      onClearFilters={onClearFilters}
    />
  );
};
