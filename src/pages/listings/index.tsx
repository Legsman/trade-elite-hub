
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { ListingFilters } from "@/components/listings/ListingFilters";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { useListings } from "@/hooks/listings";
import { useAnalytics } from "@/hooks/use-analytics";

const ListingsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<string>("");
  const [listingType, setListingType] = useState<string>("all");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState<string>("any");
  const { trackEvent } = useAnalytics();
  const navigate = useNavigate();

  // Fetch listings with filters
  const { listings, isLoading, error, refetch } = useListings({
    category,
    searchTerm,
    listingType,
    priceRange,
    sortBy,
  });

  // Track filter changes
  useEffect(() => {
    if (category || searchTerm || listingType !== "all" || priceRange !== "any" || sortBy !== "newest") {
      trackEvent("listings_filtered", {
        category: category || "all",
        search: searchTerm ? "yes" : "no",
        listingType: listingType || "all",
        priceRange: priceRange || "any",
        sortBy: sortBy || "newest",
      });
    }
  }, [category, searchTerm, listingType, priceRange, sortBy, trackEvent]);

  const handleCardClick = (id: string) => {
    trackEvent("listing_clicked", { listingId: id });
    navigate(`/listings/${id}`);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setCategory("");
    setListingType("all");
    setPriceRange("any");
    setSortBy("newest");
    trackEvent("listings_filters_reset");
  };

  const handleFilterChange = (filters: any) => {
    setSearchTerm(filters.searchTerm);
    setCategory(filters.category);
    setListingType(filters.listingType);
    setPriceRange(filters.priceRange);
    setSortBy(filters.sortBy);
  };

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Browse Listings</h1>
            <p className="text-muted-foreground">
              Find the perfect items from our curated marketplace
            </p>
          </div>
          <Button 
            className="mt-4 md:mt-0" 
            onClick={() => {
              trackEvent("create_listing_clicked");
              navigate("/listings/create");
            }}
          >
            Create New Listing
          </Button>
        </div>

        {/* Search and filters */}
        <ListingFilters onFilterChange={handleFilterChange} />

        {/* Results count and clear filters button */}
        {!isLoading && !error && (
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Showing {listings.length} results
            </p>
            {(category || searchTerm || listingType !== "all" || priceRange !== "any" || sortBy !== "newest") && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Results grid */}
        <ListingGrid 
          listings={listings} 
          isLoading={isLoading} 
          error={error}
          onListingClick={handleCardClick}
          onRefresh={refetch}
        />
      </div>
    </MainLayout>
  );
};

export default ListingsPage;
