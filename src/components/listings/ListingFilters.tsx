
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
  onFilterChange: (filters: {
    searchTerm: string;
    category: string;
    listingType: string;
    priceRange: string;
    sortBy: string;
  }) => void;
  categories?: string[];
  initialFilters?: {
    searchTerm?: string;
    category?: string;
    listingType?: string;
    priceRange?: string;
    sortBy?: string;
  };
}

export const ListingFilters = ({
  onFilterChange,
  categories = ["cars", "watches", "homes", "commercials", "collectables"],
  initialFilters = {},
}: ListingFiltersProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm || searchParams.get("search") || "");
  const [category, setCategory] = useState(initialFilters.category || searchParams.get("category") || "");
  const [listingType, setListingType] = useState(initialFilters.listingType || searchParams.get("type") || "all");
  const [priceRange, setPriceRange] = useState(initialFilters.priceRange || searchParams.get("price") || "any");
  const [sortBy, setSortBy] = useState(initialFilters.sortBy || searchParams.get("sort") || "newest");

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (category) params.append("category", category);
    if (searchTerm) params.append("search", searchTerm);
    if (listingType && listingType !== "all") params.append("type", listingType);
    if (sortBy && sortBy !== "newest") params.append("sort", sortBy);
    if (priceRange && priceRange !== "any") params.append("price", priceRange);
    
    setSearchParams(params);

    onFilterChange({
      searchTerm,
      category,
      listingType,
      priceRange,
      sortBy,
    });
  }, [category, searchTerm, listingType, priceRange, sortBy, onFilterChange, setSearchParams]);

  const resetFilters = () => {
    setSearchTerm("");
    setCategory("");
    setListingType("all");
    setPriceRange("any");
    setSortBy("newest");
  };

  return (
    <div className="bg-muted/40 rounded-lg p-4 mb-8">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search listings..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={category ? "outline" : "default"}
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setCategory("")}
          >
            All Categories
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={listingType} onValueChange={setListingType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Listing Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="auction">Auction</SelectItem>
            <SelectItem value="classified">Classified</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priceRange} onValueChange={setPriceRange}>
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

        <Select value={sortBy} onValueChange={setSortBy}>
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

      {(category || searchTerm || listingType !== "all" || priceRange !== "any" || sortBy !== "newest") && (
        <div className="mt-4 text-right">
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
};
