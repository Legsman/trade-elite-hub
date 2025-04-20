
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, ChevronDown } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
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
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Listing } from "@/types";
import { useListings } from "@/hooks/use-listing";
import { useAnalytics } from "@/hooks/use-analytics";
import { Loading } from "@/components/ui/loading";

const ListingsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<string>("");
  const [listingType, setListingType] = useState<string>("all");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState<string>("any");
  const { trackEvent } = useAnalytics();
  const navigate = useNavigate();

  // Use the querystring to restore filters when navigating back
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlCategory = urlParams.get("category");
    const urlSearchTerm = urlParams.get("search");
    const urlListingType = urlParams.get("type");
    const urlSortBy = urlParams.get("sort");
    const urlPriceRange = urlParams.get("price");

    if (urlCategory) setCategory(urlCategory);
    if (urlSearchTerm) setSearchTerm(urlSearchTerm);
    if (urlListingType) setListingType(urlListingType);
    if (urlSortBy) setSortBy(urlSortBy);
    if (urlPriceRange) setPriceRange(urlPriceRange);
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (category) params.append("category", category);
    if (searchTerm) params.append("search", searchTerm);
    if (listingType && listingType !== "all") params.append("type", listingType);
    if (sortBy && sortBy !== "newest") params.append("sort", sortBy);
    if (priceRange && priceRange !== "any") params.append("price", priceRange);
    
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
  }, [category, searchTerm, listingType, sortBy, priceRange]);

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
              <Button
                variant={category === "cars" ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory("cars")}
              >
                Cars
              </Button>
              <Button
                variant={category === "watches" ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory("watches")}
              >
                Watches
              </Button>
              <Button
                variant={category === "homes" ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory("homes")}
              >
                Homes
              </Button>
              <Button
                variant={category === "commercials" ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory("commercials")}
              >
                Commercials
              </Button>
              <Button
                variant={category === "collectables" ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory("collectables")}
              >
                Collectables
              </Button>
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
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="py-12">
            <Loading message="Loading listings..." />
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button variant="outline" onClick={refetch}>
              Try Again
            </Button>
          </div>
        ) : (
          <>
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

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {listings.map((listing) => (
                <Card
                  key={listing.id}
                  className="overflow-hidden cursor-pointer transition-all hover:shadow-md"
                  onClick={() => handleCardClick(listing.id)}
                >
                  <div className="aspect-video relative">
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="object-cover h-full w-full"
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2 bg-background/90 text-xs font-medium rounded-full px-2 py-1">
                      {listing.type === "auction" ? "Auction" : "For Sale"}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold line-clamp-1">{listing.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {listing.location}
                      </p>
                    </div>
                    <div className="mt-1 text-lg font-bold text-purple">
                      £{listing.price.toLocaleString()}
                    </div>
                    <p className="mt-2 text-sm line-clamp-2">{listing.description}</p>
                  </CardContent>
                  <Separator />
                  <CardFooter className="p-4 flex justify-between text-xs text-muted-foreground">
                    <span>{listing.views} views</span>
                    <span>{listing.saves} saves</span>
                    <span className="capitalize">{listing.category}</span>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {listings.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No listings found matching your criteria.</p>
                <Button variant="outline" className="mt-4" onClick={resetFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default ListingsPage;
