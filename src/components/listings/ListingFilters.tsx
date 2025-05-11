
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ListingFiltersProps {
  filters: {
    searchTerm: string;
    category: string;
    listingType: string;
    priceRange: string;
    sortBy: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  categories?: string[];
}

export const ListingFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
  categories = ["cars", "watches", "homes", "commercials", "collectables"],
}: ListingFiltersProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.category) params.append("category", filters.category);
    if (filters.searchTerm) params.append("search", filters.searchTerm);
    if (filters.listingType && filters.listingType !== "all") params.append("type", filters.listingType);
    if (filters.sortBy && filters.sortBy !== "newest") params.append("sort", filters.sortBy);
    if (filters.priceRange && filters.priceRange !== "any") params.append("price", filters.priceRange);
    
    setSearchParams(params);
  }, [filters, setSearchParams]);

  return (
    <div className="bg-muted/40 rounded-lg p-4 mb-8">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search listings..."
            className="pl-10"
            value={filters.searchTerm}
            onChange={(e) => onFilterChange("searchTerm", e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.category ? "outline" : "default"}
            size="sm"
            className="flex items-center gap-1"
            onClick={() => onFilterChange("category", "")}
          >
            All Categories
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={filters.category === cat ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange("category", cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Select 
          value={filters.listingType || "all"} 
          onValueChange={(value) => onFilterChange("listingType", value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Listing Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="auction">Auction</SelectItem>
            <SelectItem value="classified">Classified</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={filters.priceRange || "any"} 
          onValueChange={(value) => onFilterChange("priceRange", value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Price</SelectItem>
            <SelectItem value="0-1000">Under £1,000</SelectItem>
            <SelectItem value="1000-10000">£1,000 - £10,000</SelectItem>
            <SelectItem value="10000-50000">£10,000 - £50,000</SelectItem>
            <SelectItem value="50000-100000">£50,000 - £100,000</SelectItem>
            <SelectItem value="100000-500000">£100,000 - £500,000</SelectItem>
            <SelectItem value="500000-">£500,000+</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={filters.sortBy || "newest"} 
          onValueChange={(value) => onFilterChange("sortBy", value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" className="sm:ml-auto">
          <Filter className="h-4 w-4" />
          <span className="sr-only">More filters</span>
        </Button>
      </div>

      {(filters.category || filters.searchTerm || filters.listingType !== "all" || filters.priceRange !== "any" || filters.sortBy !== "newest") && (
        <div className="mt-4 text-right">
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
};
