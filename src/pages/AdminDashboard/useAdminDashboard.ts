
import { useCallback, useState, useMemo, useEffect } from "react";
import { useUsersAdminData } from "./hooks/useUsersAdminData";
import { useListingsAdminData } from "./hooks/useListingsAdminData";
import { useReportsAdminData } from "./hooks/useReportsAdminData";
import { useAdminStats } from "./hooks/useAdminStats";
import { useAdminSearchFilters } from "./hooks/useAdminSearchFilters";
import { useAdminActions } from "./hooks/useAdminActions";
import { useCurrentAdminUser } from "./hooks/useCurrentAdminUser";
import { toast } from "@/hooks/use-toast";

export const SUPABASE_URL = "https://hwnsooioeqydhyukenfe.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3bnNvb2lvZXF5ZGh5dWtlbmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxODI5NjgsImV4cCI6MjA2MDc1ODk2OH0.trG5sAD9qaxe5gwpxQ2ZtIKteBZkFEJnpYMbSYIf9tY";

export function useAdminDashboard() {
  const [fetchError, setFetchError] = useState<string | null>(null);

  const { users, loading: loadingUsers, setUsers, error: usersError, refetchUsers } = useUsersAdminData();
  const userIdToName = useMemo(
    () => Object.fromEntries(users.map(u => [u.id, u.full_name])),
    [users]
  );
  
  console.log("useAdminDashboard - Users and their roles:", users.map(u => ({ name: u.full_name, role: u.role })));
  console.log("useAdminDashboard - Admin users:", users.filter(u => u.role === "admin"));
  
  const { listings, loading: loadingListings, setListings, error: listingsError } = useListingsAdminData(userIdToName);
  const { reports, loading: loadingReports, setReports, error: reportsError } = useReportsAdminData(userIdToName);
  const { stats, analyticsData, setStats } = useAdminStats(users, listings, reports);

  const {
    searchQuery, setSearchQuery,
    userFilter, setUserFilter,
    listingFilter, setListingFilter,
    filteredUsers,
    filteredListings,
  } = useAdminSearchFilters(users, listings);

  const currentUserId = useCurrentAdminUser();

  const {
    promoteAdmin,
    demoteAdmin,
    handleApproveItem,
    handleRejectItem,
    handleSuspendUser,
    handleUnsuspendUser,
  } = useAdminActions(setUsers, setListings, setReports);

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
      setFetchError(null);
      await refetchUsers();
      toast({
        title: "Refreshing data",
        description: "Attempting to fetch fresh admin data"
      });
    } catch (error) {
      console.error("Failed to refresh data:", error);
      setFetchError(error instanceof Error ? error.message : "Failed to refresh data");
    }
  }, [refetchUsers]);

  return {
    users, setUsers,
    listings, setListings,
    reports, setReports,
    reportedItems: reports,
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
