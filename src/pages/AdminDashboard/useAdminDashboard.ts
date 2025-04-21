
import { useMemo, useCallback, useState, useEffect } from "react";
import { useUsersAdminData } from "./hooks/useUsersAdminData";
import { useListingsAdminData } from "./hooks/useListingsAdminData";
import { useReportsAdminData } from "./hooks/useReportsAdminData";
import { useAdminStats } from "./hooks/useAdminStats";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { assignOrRemoveAdminRole } from "@/utils/adminUtils";

// Export constants from client.ts to ensure consistency
export const SUPABASE_URL = "https://hwnsooioeqydhyukenfe.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3bnNvb2lvZXF5ZGh5dWtlbmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxODI5NjgsImV4cCI6MjA2MDc1ODk2OH0.trG5sAD9qaxe5gwpxQ2ZtIKteBZkFEJnpYMbSYIf9tY";

export function useAdminDashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [listingFilter, setListingFilter] = useState("all");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [fetchError, setFetchError] = useState<string | null>(null);

  const { users, loading: loadingUsers, setUsers, error: usersError } = useUsersAdminData();
  const userIdToName = useMemo(
    () => Object.fromEntries(users.map(u => [u.id, u.full_name])),
    [users]
  );
  
  const { listings, loading: loadingListings, setListings, error: listingsError } = useListingsAdminData(userIdToName);
  const { reports, loading: loadingReports, setReports, error: reportsError } = useReportsAdminData(userIdToName);
  const { stats, analyticsData, setStats } = useAdminStats(users, listings, reports);

  // Detect and update the fetchError state
  useEffect(() => {
    const combinedError = usersError || listingsError || reportsError;
    if (combinedError) {
      console.error("Admin data error:", combinedError);
      setFetchError(combinedError instanceof Error ? combinedError.message : String(combinedError));
    } else {
      setFetchError(null);
    }
  }, [usersError, listingsError, reportsError]);

  const refetchData = useCallback(async () => {
    try {
      // Reset errors
      setFetchError(null);
      
      // We'll trigger refetches in the individual hooks by updating their dependencies
      setUsers([...users]); // This will trigger a re-render which should initiate refetching in the hooks
      
      toast({
        title: "Refreshing data",
        description: "Attempting to fetch fresh admin data"
      });
    } catch (error) {
      console.error("Failed to refresh data:", error);
      setFetchError(error instanceof Error ? error.message : "Failed to refresh data");
    }
  }, [users, setUsers]);

  const promoteAdmin = useCallback(async (userId: string) => {
    const { success, error } = await assignOrRemoveAdminRole(userId, "admin", "add");
    if (success) {
      setUsers(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, role: "admin" } : u
        )
      );
      toast({ title: "Admin promoted", description: "User has been made an admin" });
    } else {
      toast({ title: "Failed to promote", description: error?.message || error || "Failed", variant: "destructive" });
    }
  }, []);

  const demoteAdmin = useCallback(async (userId: string) => {
    const { success, error } = await assignOrRemoveAdminRole(userId, "admin", "remove");
    if (success) {
      setUsers(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, role: "user" } : u
        )
      );
      toast({ title: "Admin removed", description: "User has been demoted from admin" });
    } else {
      toast({ title: "Failed to demote", description: error?.message || error || "Failed", variant: "destructive" });
    }
  }, []);

  const handleApproveItem = useCallback((id: string, type: string) => {
    if (type === 'listing') {
      setListings(prev =>
        prev.map(item => item.id === id ? { ...item, status: 'active' } : item)
      );
    } else if (type === 'report') {
      setReports(prev =>
        prev.map(item => item.id === id ? { ...item, status: 'resolved' } : item)
      );
    }

    toast({
      title: "Item approved",
      description: `The ${type} has been approved successfully`,
    });
  }, []);

  const handleRejectItem = useCallback((id: string, type: string) => {
    if (type === 'listing') {
      setListings(prev =>
        prev.map(item => item.id === id ? { ...item, status: 'rejected' } : item)
      );
    } else if (type === 'report') {
      setReports(prev =>
        prev.map(item => item.id === id ? { ...item, status: 'dismissed' } : item)
      );
    }
    toast({
      title: "Item rejected",
      description: `The ${type} has been rejected`,
    });
  }, []);

  const handleSuspendUser = useCallback((id: string) => {
    setUsers(prev =>
      prev.map(user => user.id === id ? { ...user, status: 'suspended' } : user)
    );
    toast({
      title: "User suspended",
      description: "The user has been suspended",
    });
  }, []);

  const handleUnsuspendUser = useCallback((id: string) => {
    setUsers(prev =>
      prev.map(user => user.id === id ? { ...user, status: 'active', strike_count: 0 } : user)
    );
    toast({
      title: "User unsuspended",
      description: "The user has been unsuspended and can now use the platform again",
    });
  }, []);

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

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
        }
      } catch (error) {
        console.error("Failed to get current user:", error);
      }
    }

    fetchInitialData();
  }, []);

  return {
    users, setUsers,
    listings, setListings,
    reports, setReports,
    reportedItems: reports, // Add alias for backward compatibility
    stats, analyticsData, setStats,
    loading: loadingUsers || loadingListings || loadingReports,
    searchQuery,
    setSearchQuery,
    userFilter,
    setUserFilter,
    listingFilter,
    setListingFilter,
    handleApproveItem,
    handleRejectItem,
    handleSuspendUser,
    handleUnsuspendUser,
    filteredUsers,
    filteredListings,
    promoteAdmin,
    demoteAdmin,
    currentUserId,
    fetchError,
    refetchData
  };
}
