
import { useState, useMemo } from "react";
import { UserAdmin, ListingAdmin } from "../types";
import { getEffectiveListingStatus } from "@/utils/listingStatus";

// Adapter function to convert ListingAdmin to minimal Listing shape needed for status helpers
function asListing(listing: ListingAdmin): any {
  // Only provide the fields used by getEffectiveListingStatus and related helpers
  // Defaults ensure correct behavior for admin logic
  return {
    ...listing,
    sellerId: listing.seller_id || "",
    description: "",
    type: "",
    location: "",
    images: [],
    allowBestOffer: false,
    expiresAt: listing.created_at, // fallback; effective expiry checks not used for admin
    createdAt: listing.created_at,
    updatedAt: listing.created_at,
    status: listing.status,
    // Extra fields for compatibility; fill with dummy values if not present
    currentBid: undefined,
    highestBidderId: undefined,
    bidCount: undefined,
    reservePrice: undefined,
  };
}

export function useAdminSearchFilters(users: UserAdmin[], listings: ListingAdmin[]) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [listingFilter, setListingFilter] = useState<string>("all");

  // Filter users based on search query and selected filter
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        !searchQuery ||
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter = userFilter === "all" 
        || (userFilter === "admin" && user.role === "admin")
        || (userFilter === "verified" && user.verified_status === "verified")
        || (userFilter === "unverified" && user.verified_status === "unverified")
        || (userFilter === "suspended" && user.strike_count >= 3);

      return matchesSearch && matchesFilter;
    });
  }, [users, searchQuery, userFilter]);

  // --- UPDATED: Use centralized "effectiveStatus" for admin listing filters ---
  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesSearch =
        !searchQuery ||
        listing.title?.toLowerCase().includes(searchQuery.toLowerCase());

      const effectiveStatus = getEffectiveListingStatus(asListing(listing)); // ADAPT

      // Admin UI: Show by "effective status" for filtering
      const matchesFilter =
        listingFilter === "all" ||
        effectiveStatus.toLowerCase() === listingFilter.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [listings, searchQuery, listingFilter]);

  return {
    searchQuery,
    setSearchQuery,
    userFilter,
    setUserFilter,
    listingFilter,
    setListingFilter,
    filteredUsers,
    filteredListings,
  };
}
