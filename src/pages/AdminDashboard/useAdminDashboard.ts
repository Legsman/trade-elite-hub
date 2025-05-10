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
  const { toast } = useAdminToastManager();
  const [pendingOperations, setPendingOperations] = useState<Record<string, boolean>>({});

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

  // We'll track pending operations for specific users
  const isPendingForUser = useCallback((userId: string): boolean => {
    return pendingOperations[`user_${userId}`] === true;
  }, [pendingOperations]);

  const startOperation = useCallback((type: string, id: string) => {
    const operationKey = `${type}_${id}`;
    setPendingOperations(prev => ({
      ...prev,
      [operationKey]: true
    }));
    return operationKey;
  }, []);

  const finishOperation = useCallback((operationKey: string) => {
    setPendingOperations(prev => {
      const updated = {...prev};
      delete updated[operationKey];
      return updated;
    });
  }, []);

  const {
    promoteAdmin,
    demoteAdmin,
    toggleVerifiedStatus,
    handleApproveItem,
    handleRejectItem,
    handleSuspendUser,
    handleUnsuspendUser,
  } = useAdminActions(setUsers, setListings, setReports, startOperation, finishOperation);

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
      
      const refreshToastId = "refresh_data";
      setIsRefetching(true);
      setFetchError(null);
      
      // Create a toast for the refresh operation
      const refreshToast = toast.loading({
        title: "Refreshing Data",
        description: "Fetching latest data from the server...",
        id: refreshToastId
      });
      
      await refetchUsers();
      
      // Update the toast after a successful refresh
      toast.success({
        title: "Data Refreshed",
        description: "Dashboard data has been updated successfully",
        id: refreshToastId
      });
      
    } catch (error) {
      console.error("Failed to refresh data:", error);
      setFetchError(error instanceof Error ? error.message : "Failed to refresh data");
      
      toast.error({
        title: "Error Refreshing Data",
        description: "Please try again or contact support",
        id: "refresh_data"
      });
    } finally {
      setIsRefetching(false);
    }
  }, [refetchUsers, isRefetching, toast]);

  // Improved role operation handler
  const handleRoleOperationWithRefresh = useCallback(async (operationFn: Function, ...args: any[]) => {
    // Create a unique ID for this operation
    const operationType = operationFn.name || 'role_operation';
    const targetId = args[0] || 'unknown';
    const operationId = `${operationType}_${targetId}`;
    
    try {
      // Show initial loading toast
      toast.loading({
        title: "Processing Request",
        description: "Your request is being processed...",
        id: operationId
      });
      
      // Perform the operation
      const result = await operationFn(...args);
      
      // Handle the result based on success
      if (result?.success) {
        // First toast update - operation was successful on function level
        toast.update({
          title: "Request Processed", 
          description: "Waiting for database to update...",
          id: operationId
        });
        
        // Silently refresh in background to get latest data
        setIsRefetching(true);
        
        try {
          // Wait for backend changes to propagate
          await new Promise(resolve => setTimeout(resolve, 2000));
          await refetchUsers();
          
          // Final success toast
          toast.success({
            title: "Operation Complete",
            description: result.message || "Changes have been applied successfully",
            id: operationId
          });
        } catch (refreshError) {
          console.error("Error refreshing after successful operation:", refreshError);
          // Still mark as success but note the refresh issue
          toast.success({
            title: "Operation Complete",
            description: "Changes made but there was an issue refreshing the data. You may need to refresh manually.",
            id: operationId
          });
        } finally {
          setIsRefetching(false);
        }
      } else {
        // Operation failed at the function level
        console.error("Operation failed:", result?.error);
        toast.error({
          title: "Operation Failed",
          description: result?.error?.message || "Please try again later",
          id: operationId
        });
      }
      
      return result;
    } catch (error) {
      // Unexpected error during the entire process
      console.error("Exception during role operation:", error);
      
      toast.error({
        title: "Unexpected Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        id: operationId
      });
      
      return { success: false, error };
    }
  }, [refetchUsers, toast]);

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
    promoteAdmin: enhancedPromoteAdmin,
    demoteAdmin: enhancedDemoteAdmin,
    toggleVerifiedStatus: enhancedToggleVerifiedStatus,
    currentUserId,
    fetchError,
    refetchData,
    pendingOperations,
    isPendingForUser,
    isRefetching
  };
}
