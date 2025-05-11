
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useListings } from "@/hooks/listings";
import MainLayout from "@/components/layout/MainLayout";
import { useListingBids } from "@/hooks/listings";
import { 
  ListingFilterSidebar, 
  ListingContent 
} from "@/components/listings";

const ListingsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const pageSize = 9; // Number of items per page
  
  // Get query parameters
  const category = searchParams.get("category") || "";
  const type = searchParams.get("type") || "";
  const location = searchParams.get("location") || "";
  const condition = searchParams.get("condition") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sortBy = searchParams.get("sortBy") || "newest";
  const page = searchParams.get("page") || "1";
  const [priceRange, setPriceRange] = useState<number[]>([
    minPrice ? parseInt(minPrice) : 0,
    maxPrice ? parseInt(maxPrice) : 10000,
  ]);
  const [allowBestOffer, setAllowBestOffer] = useState(searchParams.get("allowBestOffer") === "true");
  
  // Get listings
  const { listings, isLoading, error, totalCount } = useListings({
    category,
    type,
    location,
    condition,
    minPrice: priceRange[0].toString(),
    maxPrice: priceRange[1].toString(),
    sortBy,
    page,
    allowBestOffer: allowBestOffer ? "true" : "false",
  });
  
  // Calculate pagination
  const currentPage = parseInt(page);
  
  // Update URL parameters
  const updateParams = (newParams: Record<string, string | null>) => {
    Object.keys(newParams).forEach((key) => {
      if (newParams[key] === null || newParams[key] === "") {
        searchParams.delete(key);
      } else {
        searchParams.set(key, newParams[key]!);
      }
    });
    setSearchParams(searchParams);
  };
  
  // Handle filter changes
  const handleCategoryChange = (value: string) => {
    updateParams({ category: value === "all_categories" ? "" : value });
  };
  
  const handleTypeChange = (value: string) => {
    updateParams({ type: value === "all_types" ? "" : value });
  };
  
  const handleLocationChange = (value: string) => {
    updateParams({ location: value === "all_locations" ? "" : value });
  };
  
  const handleConditionChange = (value: string) => {
    updateParams({ condition: value === "all_conditions" ? "" : value });
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
  
  // Add this to get the highest bids for all listings
  const { highestBids } = useListingBids(
    listings?.filter(listing => listing.type === "auction").map(listing => listing.id) || []
  );
  
  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Browse Listings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Filters */}
          <ListingFilterSidebar
            category={category || "all_categories"}
            type={type || "all_types"}
            location={location || "all_locations"}
            condition={condition || "all_conditions"}
            priceRange={priceRange}
            sortBy={sortBy || "newest"}
            allowBestOffer={allowBestOffer}
            onCategoryChange={handleCategoryChange}
            onTypeChange={handleTypeChange}
            onLocationChange={handleLocationChange}
            onConditionChange={handleConditionChange}
            onPriceChange={handlePriceChange}
            onPriceApply={handlePriceApply}
            onSortChange={handleSortChange}
            onAllowBestOfferChange={handleAllowBestOfferChange}
          />
          
          <div className="lg:col-span-4">
            <ListingContent
              listings={listings}
              isLoading={isLoading}
              error={error}
              totalCount={totalCount}
              pageSize={pageSize}
              currentPage={currentPage}
              highestBids={highestBids}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ListingsPage;
