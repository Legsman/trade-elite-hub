
import { useCallback, useState, useMemo, useEffect } from "react";
import { useUsersAdminData } from "./hooks/useUsersAdminData";
import { useListingsAdminData } from "./hooks/useListingsAdminData";
import { useReportsAdminData } from "./hooks/useReportsAdminData";
import { useAdminStats } from "./hooks/useAdminStats";
import { useAdminSearchFilters } from "./hooks/useAdminSearchFilters";
import { useAdminActions } from "./hooks/useAdminActions";
import { useCurrentAdminUser } from "./hooks/useCurrentAdminUser";
import { useAdminToastManager } from "@/hooks/useAdminToastManager";

export const SUPABASE_URL = "https://hwnsooioeqydhyukenfe.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3bnNvb2lvZXF5ZGh5dWtlbmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxODI5NjgsImV4cCI6MjA2MDc1ODk2OH0.trG5sAD9qaxe5gwpxQ2ZtIKteBZkFEJnpYMbSYIf9tY";

export function useAdminDashboard() {
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const { createProcessingToast, updateToast } = useAdminToastManager();

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
    toggleVerifiedStatus,
    handleApproveItem,
    handleRejectItem,
    handleSuspendUser,
    handleUnsuspendUser,
    loadingUserId
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
      if (isRefetching) {
        console.log("Already refetching data, request ignored");
        return;
      }
      
      setIsRefetching(true);
      setFetchError(null);
      
      const toastId = createProcessingToast("refresh");
      
      await refetchUsers();
      
      // Slight delay to ensure UI updates are visible
      setTimeout(() => {
        updateToast(toastId, "success", "refresh");
        setIsRefetching(false);
      }, 500);
      
    } catch (error) {
      console.error("Failed to refresh data:", error);
      setFetchError(error instanceof Error ? error.message : "Failed to refresh data");
      
      updateToast(null, "error", "refresh", {
        title: "Error refreshing data",
        description: "Please try again or contact support",
        variant: "destructive"
      });

      setIsRefetching(false);
    }
  }, [refetchUsers, isRefetching, createProcessingToast, updateToast]);

  const handleRoleOperationWithRefresh = useCallback(async (operationFn: Function, ...args: any[]) => {
    try {
      const result = await operationFn(...args);
      
      if (result?.success) {
        // Only refresh if the operation was successful
        const refreshToastId = createProcessingToast("refresh", {
          title: "Refreshing",
          description: "Updating data..."
        });
        
        await refetchData();
        
        updateToast(refreshToastId, "success", "refresh", {
          title: "Updated",
          description: "Data has been refreshed successfully"
        });
      }
      
      return result;
    } catch (error) {
      console.error("Error during role operation:", error);
      return { success: false, error };
    }
  }, [refetchData, createProcessingToast, updateToast]);

  const enhancedPromoteAdmin = useCallback((userId: string) => {
    return handleRoleOperationWithRefresh(promoteAdmin, userId);
  }, [handleRoleOperationWithRefresh, promoteAdmin]);
  
  const enhancedDemoteAdmin = useCallback((userId: string) => {
    return handleRoleOperationWithRefresh(demoteAdmin, userId);
  }, [handleRoleOperationWithRefresh, demoteAdmin]);
  
  const enhancedToggleVerifiedStatus = useCallback((userId: string, currentStatus: "verified" | "unverified") => {
    return handleRoleOperationWithRefresh(toggleVerifiedStatus, userId, currentStatus);
  }, [handleRoleOperationWithRefresh, toggleVerifiedStatus]);

  return {
    users, setUsers,
    listings, setListings,
    reports, setReports,
    reportedItems: reports,
    stats, analyticsData, setStats,
    loading: loadingUsers || loadingListings || loadingReports || isRefetching,
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
    promoteAdmin: enhancedPromoteAdmin,
    demoteAdmin: enhancedDemoteAdmin,
    toggleVerifiedStatus: enhancedToggleVerifiedStatus,
    currentUserId,
    fetchError,
    refetchData,
    loadingUserId,
    isRefetching
  };
}
