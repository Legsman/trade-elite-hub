import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminDashboardContext } from "../context/AdminDashboardContext";
import { getEffectiveListingStatus, getStatusBadgeVariant } from "@/utils/listingStatus";

// Adapter function to convert ListingAdmin to minimal Listing shape needed for status helpers
function asListing(listing) {
  return {
    ...listing,
    sellerId: listing.seller_id || "",
    description: "",
    type: "",
    location: "",
    images: [],
    allowBestOffer: false,
    expiresAt: listing.created_at, // fallback
    createdAt: listing.created_at,
    updatedAt: listing.created_at,
    status: listing.status,
    currentBid: undefined,
    highestBidderId: undefined,
    bidCount: undefined,
    reservePrice: undefined,
  };
}

const ListingsTab: React.FC = () => {
  const navigate = useNavigate();
  const {
    filteredListings = [],
    searchQuery = "",
    setSearchQuery = () => {},
    listingFilter = "all",
    setListingFilter = () => {},
    formatDate,
    handleApproveItem,
    handleRejectItem,
  } = useAdminDashboardContext();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search listings..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={listingFilter} onValueChange={setListingFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Listings</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredListings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  No listings found matching your search criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredListings.map((listing) => {
                // Use the adapter for status utilities
                const effectiveStatus = getEffectiveListingStatus(asListing(listing));
                const badge = getStatusBadgeVariant(asListing(listing));
                return (
                  <TableRow key={listing.id}>
                    <TableCell className="font-medium">{listing.title}</TableCell>
                    <TableCell>{listing.seller_name}</TableCell>
                    <TableCell>£{listing.price.toLocaleString()}</TableCell>
                    <TableCell className="capitalize">{listing.category}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className={`px-2 py-0.5 rounded text-xs text-white ${badge.color} ${badge.pulse ? "animate-pulse" : ""}`}>
                          {badge.text}
                        </span>
                        <span className="block text-[10px] text-muted-foreground mt-1">
                          db: <strong>{listing.status}</strong>
                          {effectiveStatus !== listing.status && (
                            <> → eff: <strong>{effectiveStatus}</strong></>
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(listing.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/listings/${listing.id}`)}
                        >
                          View
                        </Button>
                        {listing.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveItem(listing.id, 'listing')}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectItem(listing.id, 'listing')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {listing.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectItem(listing.id, 'listing')}
                          >
                            Suspend
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ListingsTab;
