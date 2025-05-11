
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ListingFilterSidebarProps {
  category: string;
  type: string;
  location: string;
  condition: string;
  priceRange: number[];
  sortBy: string;
  allowBestOffer: boolean;
  onCategoryChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onConditionChange: (value: string) => void;
  onPriceChange: (value: number[]) => void;
  onPriceApply: () => void;
  onSortChange: (value: string) => void;
  onAllowBestOfferChange: (checked: boolean) => void;
}

export const ListingFilterSidebar: React.FC<ListingFilterSidebarProps> = ({
  category,
  type,
  location,
  condition,
  priceRange,
  sortBy,
  allowBestOffer,
  onCategoryChange,
  onTypeChange,
  onLocationChange,
  onConditionChange,
  onPriceChange,
  onPriceApply,
  onSortChange,
  onAllowBestOfferChange,
}) => {
  return (
    <div className="lg:col-span-1 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Category</CardTitle>
          <CardDescription>Filter by category</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={category || "all_categories"} onValueChange={onCategoryChange}>
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
          <Select value={type || "all_types"} onValueChange={onTypeChange}>
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
          <Select value={location || "all_locations"} onValueChange={onLocationChange}>
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
          <Select value={condition || "all_conditions"} onValueChange={onConditionChange}>
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
            onValueChange={onPriceChange}
          />
          <Button className="w-full mt-4" onClick={onPriceApply}>
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
              onCheckedChange={onAllowBestOfferChange}
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
          <Select value={sortBy || "newest"} onValueChange={onSortChange}>
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
  );
};
