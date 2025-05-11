
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { ListingFilters } from "@/components/listings/ListingFilters";
import { useListings } from "@/hooks/listings";
import { useListingBids } from "@/hooks/listings/useListingBids";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlusIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/auth";
import { Loading } from "@/components/ui/loading";

interface FilterState {
  category: string;
  searchTerm: string;
  listingType: string;
  priceRange: string;
  sortBy: string;
}

const Listings = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<FilterState>({
    category: "",
    searchTerm: "",
    listingType: "all",
    priceRange: "any",
    sortBy: "newest",
  });
  const [searchInput, setSearchInput] = useState("");

  // Apply filters to fetch listings
  const { listings, isLoading, error, refetch } = useListings(filters);
  
  // Get highest bids for auction listings
  const { highestBids } = useListingBids(
    listings
      .filter(listing => listing.type === "auction")
      .map(listing => listing.id)
  );

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      searchTerm: searchInput,
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearFilters = () => {
    setFilters({
      category: "",
      searchTerm: "",
      listingType: "all",
      priceRange: "any",
      sortBy: "newest",
    });
    setSearchInput("");
  };

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const category = urlSearchParams.get("category");
    
    if (category) {
      setFilters(prev => ({
        ...prev,
        category,
      }));
    }
  }, []);

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Browse Listings</h1>
            <p className="text-muted-foreground">
              Find items for sale or auction
            </p>
          </div>
          
          {user && (
            <Button asChild>
              <Link to="/listings/create">
                <PlusIcon className="mr-2 h-4 w-4" /> Create Listing
              </Link>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar with filters */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <div className="relative">
                <Input
                  placeholder="Search listings..."
                  className="pr-16"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button
                  className="absolute right-0 top-0 rounded-l-none"
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </div>
            </div>
            
            <ListingFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Listings grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <Loading message="Loading listings..." />
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-red-500 mb-4">Failed to load listings</p>
                <Button onClick={refetch}>Try Again</Button>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-2xl font-bold mb-4">No listings found</h3>
                <p className="text-muted-foreground mb-8">
                  Try adjusting your filters or search criteria
                </p>
                <Button onClick={handleClearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <ListingGrid 
                listings={listings}
                highestBids={highestBids} 
              />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Listings;
