
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useListings } from "@/hooks/listings";
import MainLayout from "@/components/layout/MainLayout";
import { ListingGrid } from "@/components/listings";
import { Loading } from "@/components/ui/loading";
import { useListingBids } from "@/hooks/listings";

const ListingsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Get query parameters
  const category = searchParams.get("category") || "";
  const type = searchParams.get("type") || "";
  const location = searchParams.get("location") || "";
  const condition = searchParams.get("condition") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sortBy = searchParams.get("sortBy") || "newest"; // Changed from created_at-desc to newest to match ListingFilters
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
  const pageSize = 9;
  const totalPages = Math.ceil(totalCount / pageSize);
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
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Category</CardTitle>
                <CardDescription>Filter by category</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={category || "all_categories"} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_categories">All Categories</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="furniture">Furniture</SelectItem>
                    <SelectItem value="books">Books</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Type</CardTitle>
                <CardDescription>Filter by listing type</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={type || "all_types"} onValueChange={handleTypeChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_types">All Types</SelectItem>
                    <SelectItem value="auction">Auction</SelectItem>
                    <SelectItem value="sale">For Sale</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>Filter by location</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={location || "all_locations"} onValueChange={handleLocationChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Locations" />
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Condition</CardTitle>
                <CardDescription>Filter by item condition</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={condition || "all_conditions"} onValueChange={handleConditionChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Conditions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_conditions">All Conditions</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                    <SelectItem value="like_new">Like New</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Price</CardTitle>
                <CardDescription>Filter by price range (£)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span>{priceRange[0]}</span>
                  <span>{priceRange[1]}</span>
                </div>
                <Slider
                  min={0}
                  max={10000}
                  step={100}
                  defaultValue={priceRange}
                  onValueChange={handlePriceChange}
                />
                <Button className="w-full mt-4" onClick={handlePriceApply}>
                  Apply Price
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Allow Best Offer</CardTitle>
                <CardDescription>Show listings that allow best offers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowBestOffer"
                    checked={allowBestOffer}
                    onCheckedChange={handleAllowBestOfferChange}
                  />
                  <Label htmlFor="allowBestOffer">Only show listings with offers</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sort By</CardTitle>
                <CardDescription>Sort listings by</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={sortBy || "newest"} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Newest" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loading message="Loading listings..." />
              </div>
            ) : error || !listings ? (
              <div className="text-center py-8">
                <h2 className="text-2xl font-bold mb-4">Error</h2>
                <p className="text-muted-foreground">Failed to load listings. Please try again later.</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-8">
                <h2 className="text-2xl font-bold mb-4">No Listings Found</h2>
                <p className="text-muted-foreground">No listings match your criteria. Try adjusting your filters.</p>
              </div>
            ) : (
              <>
                <ListingGrid listings={listings} highestBids={highestBids} />
                {totalCount > pageSize && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href={currentPage > 1 ? `?page=${currentPage - 1}` : undefined}
                          onClick={() => handlePageChange(currentPage - 1)}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                        <PaginationItem key={pageNumber}>
                          {currentPage === pageNumber ? (
                            <PaginationLink href={`?page=${pageNumber}`} isActive>
                              {pageNumber}
                            </PaginationLink>
                          ) : (
                            <PaginationLink href={`?page=${pageNumber}`} onClick={() => handlePageChange(pageNumber)}>
                              {pageNumber}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href={currentPage < totalPages ? `?page=${currentPage + 1}` : undefined}
                          onClick={() => handlePageChange(currentPage + 1)}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ListingsPage;
