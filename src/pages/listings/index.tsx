
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useListings } from "@/hooks/listings";
import MainLayout from "@/components/layout/MainLayout";
import { useListingBids } from "@/hooks/listings";
import { ListingContent } from "@/components/listings";
import { ListingFiltersHorizontal } from "@/components/listings/ListingFiltersHorizontal";

const ListingsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const pageSize = 9; // Number of items per page
  
  // Set up error display limits to prevent toast spam
  const [errorDisplayed, setErrorDisplayed] = useState(false);
  
  // Get query parameters
  const category = searchParams.get("category") || "all_categories";
  const type = searchParams.get("type") || "all_types";
  const location = searchParams.get("location") || "all_locations";
  const condition = searchParams.get("condition") || "all_conditions";
  const minPrice = searchParams.get("minPrice") || "0";
  const maxPrice = searchParams.get("maxPrice") || "10000";
  const sortBy = searchParams.get("sortBy") || "newest";
  const page = searchParams.get("page") || "1";
  const searchTerm = searchParams.get("search") || "";
  
  const [priceRange, setPriceRange] = useState<number[]>([
    parseInt(minPrice) || 0,
    parseInt(maxPrice) || 10000,
  ]);
  const [allowBestOffer, setAllowBestOffer] = useState(searchParams.get("allowBestOffer") === "true");
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  
  // Get listings
  const { listings, isLoading, error, totalCount, refetch } = useListings({
    category: category !== "all_categories" ? category : "",
    type: type !== "all_types" ? type : "",
    location: location !== "all_locations" ? location : "",
    condition: condition !== "all_conditions" ? condition : "",
    minPrice: priceRange[0].toString(),
    maxPrice: priceRange[1].toString(),
    sortBy,
    page,
    allowBestOffer: allowBestOffer ? "true" : "false",
    searchTerm,
  });
  
  // Calculate pagination
  const currentPage = parseInt(page) || 1;
  
  // Handle error toasting with rate limiting
  useEffect(() => {
    if (error && !errorDisplayed) {
      toast({
        title: "Error loading listings",
        description: "We're having trouble connecting to the server. Please try again later.",
        variant: "destructive",
      });
      setErrorDisplayed(true);
      
      // Reset error display flag after a delay to prevent continuous toasts
      const timer = setTimeout(() => {
        setErrorDisplayed(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [error, toast, errorDisplayed]);
  
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
  
  const handlePageChange = (newPage: number) => {
    updateParams({ page: newPage.toString() });
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
  
  const handleClearFilters = () => {
    navigate('/listings');
    setLocalSearchTerm("");
    setPriceRange([0, 10000]);
    setAllowBestOffer(false);
  };
  
  // Add this to get the highest bids for all listings
  const { highestBids } = useListingBids(
    listings?.filter(listing => listing.type === "auction").map(listing => listing.id) || []
  );
  
  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Browse Listings</h1>

        {/* Horizontal filters */}
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
          onClearFilters={handleClearFilters}
        />
        
        {/* Listings content */}
        <ListingContent
          listings={listings}
          isLoading={isLoading}
          error={error}
          totalCount={totalCount}
          pageSize={pageSize}
          currentPage={currentPage}
          highestBids={highestBids}
          onPageChange={handlePageChange}
          onRetry={refetch}
        />
      </div>
    </MainLayout>
  );
};

export default ListingsPage;
