
import { useState, useMemo } from "react";
import { UserAdmin, ListingAdmin } from "../types";

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

  // Filter listings based on search query and selected filter
  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesSearch =
        !searchQuery ||
        listing.title?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        listingFilter === "all" ||
        listing.status.toLowerCase() === listingFilter.toLowerCase();

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
