
import { useState, useMemo } from "react";
import { UserAdmin, ListingAdmin } from "../types";

export function useAdminSearchFilters(users: UserAdmin[], listings: ListingAdmin[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [listingFilter, setListingFilter] = useState("all");

  const filteredUsers = useMemo(() => users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    if (userFilter === 'all') return matchesSearch;
    if (userFilter === 'admin') return matchesSearch && user.role === 'admin';
    if (userFilter === 'active') return matchesSearch && user.status === 'active';
    if (userFilter === 'warning') return matchesSearch && user.status === 'warning';
    if (userFilter === 'suspended') return matchesSearch && user.status === 'suspended';
    return matchesSearch;
  }), [users, searchQuery, userFilter]);

  const filteredListings = useMemo(() => listings.filter(listing => {
    const matchesSearch = listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.seller_name?.toLowerCase().includes(searchQuery.toLowerCase());
    if (listingFilter === 'all') return matchesSearch;
    if (listingFilter === 'active') return matchesSearch && listing.status === 'active';
    if (listingFilter === 'pending') return matchesSearch && listing.status === 'pending';
    if (listingFilter === 'suspended') return matchesSearch && listing.status === 'suspended';
    return matchesSearch;
  }), [listings, searchQuery, listingFilter]);

  return {
    searchQuery, setSearchQuery,
    userFilter, setUserFilter,
    listingFilter, setListingFilter,
    filteredUsers,
    filteredListings,
  };
}
