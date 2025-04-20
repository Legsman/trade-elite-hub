
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
import { ListingType, ListingCategory, Listing } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Loading } from "@/components/ui/loading";

const MOCK_LISTINGS: Listing[] = [
  {
    id: "1",
    sellerId: "user1",
    title: "2020 Ferrari 488 Pista",
    description: "Pristine condition with only 5,000 miles",
    category: "cars",
    type: "classified",
    price: 350000,
    location: "London, UK",
    condition: "Like New",
    images: [
      "https://images.unsplash.com/photo-1592198084033-aade902d1aae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    allowBestOffer: true,
    expiresAt: new Date(2025, 5, 15),
    createdAt: new Date(2025, 2, 15),
    updatedAt: new Date(2025, 2, 15),
    status: "active",
    views: 245,
    saves: 18,
  },
  {
    id: "2",
    sellerId: "user2",
    title: "Rolex Submariner Date",
    description: "Unworn, box and papers included",
    category: "watches",
    type: "auction",
    price: 14500,
    location: "Manchester, UK",
    condition: "New",
    images: [
      "https://images.unsplash.com/photo-1620625515032-6ed0c1790c75?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    allowBestOffer: false,
    expiresAt: new Date(2025, 4, 28),
    createdAt: new Date(2025, 3, 28),
    updatedAt: new Date(2025, 3, 28),
    status: "active",
    views: 189,
    saves: 27,
  },
  {
    id: "3",
    sellerId: "user3",
    title: "Luxury Penthouse Apartment",
    description: "Stunning views, 3 bedrooms, 2 bathrooms",
    category: "homes",
    type: "classified",
    price: 2500000,
    location: "Central London, UK",
    condition: "Excellent",
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    allowBestOffer: true,
    expiresAt: new Date(2025, 6, 10),
    createdAt: new Date(2025, 3, 10),
    updatedAt: new Date(2025, 3, 10),
    status: "active",
    views: 321,
    saves: 42,
  },
  {
    id: "4",
    sellerId: "user4",
    title: "Vintage Porsche 911 (1973)",
    description: "Fully restored, matching numbers",
    category: "cars",
    type: "auction",
    price: 120000,
    location: "Birmingham, UK",
    condition: "Restored",
    images: [
      "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    allowBestOffer: false,
    expiresAt: new Date(2025, 5, 5),
    createdAt: new Date(2025, 4, 5),
    updatedAt: new Date(2025, 4, 5),
    status: "active",
    views: 278,
    saves: 23,
  },
  {
    id: "5",
    sellerId: "user5",
    title: "Patek Philippe Nautilus 5711",
    description: "Discontinued model, investment opportunity",
    category: "watches",
    type: "classified",
    price: 135000,
    location: "Edinburgh, UK",
    condition: "Excellent",
    images: [
      "https://images.unsplash.com/photo-1620625515162-c79180a03aff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    allowBestOffer: true,
    expiresAt: new Date(2025, 6, 20),
    createdAt: new Date(2025, 3, 20),
    updatedAt: new Date(2025, 3, 20),
    status: "active",
    views: 412,
    saves: 56,
  },
  {
    id: "6",
    sellerId: "user6",
    title: "Commercial Property - High Street",
    description: "Prime location with high footfall",
    category: "commercials",
    type: "classified",
    price: 850000,
    location: "Leeds, UK",
    condition: "Good",
    images: [
      "https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    allowBestOffer: true,
    expiresAt: new Date(2025, 7, 1),
    createdAt: new Date(2025, 4, 1),
    updatedAt: new Date(2025, 4, 1),
    status: "active",
    views: 156,
    saves: 11,
  },
];

const ListingsPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<string>("");
  const [listingType, setListingType] = useState<string>("");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState<string>("");
  const [listings, setListings] = useState<Listing[]>(MOCK_LISTINGS);
  const navigate = useNavigate();

  // This would be replaced by actual API calls
  useEffect(() => {
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      let filteredListings = [...MOCK_LISTINGS];
      
      // Apply search filter
      if (searchTerm) {
        filteredListings = filteredListings.filter(
          listing => listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    listing.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Apply category filter
      if (category) {
        filteredListings = filteredListings.filter(
          listing => listing.category === category
        );
      }
      
      // Apply listing type filter
      if (listingType) {
        filteredListings = filteredListings.filter(
          listing => listing.type === listingType
        );
      }
      
      // Apply price range filter
      if (priceRange) {
        const [min, max] = priceRange.split("-").map(Number);
        filteredListings = filteredListings.filter(
          listing => listing.price >= min && (max ? listing.price <= max : true)
        );
      }
      
      // Apply sorting
      switch (sortBy) {
        case "newest":
          filteredListings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          break;
        case "price-low":
          filteredListings.sort((a, b) => a.price - b.price);
          break;
        case "price-high":
          filteredListings.sort((a, b) => b.price - a.price);
          break;
        case "popular":
          filteredListings.sort((a, b) => b.views - a.views);
          break;
      }
      
      setListings(filteredListings);
      setIsLoading(false);
    }, 500);
  }, [searchTerm, category, listingType, sortBy, priceRange]);

  const handleCardClick = (id: string) => {
    navigate(`/listings/${id}`);
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
          <Button className="mt-4 md:mt-0" onClick={() => navigate("/listings/create")}>
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
                variant={category ? "default" : "outline"}
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
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="auction">Auction</SelectItem>
                <SelectItem value="classified">Classified</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Price</SelectItem>
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
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Showing {listings.length} results
              </p>
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
                <Button variant="outline" className="mt-4" onClick={() => {
                  setSearchTerm("");
                  setCategory("");
                  setListingType("");
                  setPriceRange("");
                }}>
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
