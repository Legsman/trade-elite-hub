
import { useCallback, useState, useMemo, useEffect } from "react";
import { useUsersAdminData } from "./hooks/useUsersAdminData";
import { useListingsAdminData } from "./hooks/useListingsAdminData";
import { useReportsAdminData } from "./hooks/useReportsAdminData";
import { useAdminStats } from "./hooks/useAdminStats";
import { useAdminSearchFilters } from "./hooks/useAdminSearchFilters";
import { useAdminActions } from "./hooks/useAdminActions";
import { useCurrentAdminUser } from "./hooks/useCurrentAdminUser";
import { usePendingOperations } from "./hooks/usePendingOperations";
import { useRefreshAdminData } from "./hooks/useRefreshAdminData";
import { useEnhancedRoleOperations } from "./hooks/useEnhancedRoleOperations";
import { useAdminToastManager } from "@/hooks/useAdminToastManager";

export const SUPABASE_URL = "https://hwnsooioeqydhyukenfe.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3bnNvb2lvZXF5ZGh5dWtlbmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxODI5NjgsImV4cCI6MjA2MDc1ODk2OH0.trG5sAD9qaxe5gwpxQ2ZtIKteBZkFEJnpYMbSYIf9tY";

export function useAdminDashboard() {
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { toast } = useAdminToastManager();

  // Core data hooks
  const { users, loading: loadingUsers, setUsers, error: usersError, refetchUsers } = useUsersAdminData();
  const userIdToName = useMemo(
    () => Object.fromEntries(users.map(u => [u.id, u.full_name])),
    [users]
  );
  
  // Pending operations management
  const { pendingOperations, isPendingForUser, startOperation, finishOperation } = usePendingOperations();
  
  // Data refresh management
  const { refetchData, isRefetching, setIsRefetching } = useRefreshAdminData(refetchUsers);
  
  // Core data hooks (continued)
  const { listings, loading: loadingListings, setListings, error: listingsError } = useListingsAdminData(userIdToName);
  const { reports, loading: loadingReports, setReports, error: reportsError } = useReportsAdminData(userIdToName);
  const { stats, analyticsData, setStats, isLoading: isLoadingAnalytics, error: analyticsError } = useAdminStats(users, listings, reports);

  // Search and filtering
  const {
    searchQuery, setSearchQuery,
    userFilter, setUserFilter,
    listingFilter, setListingFilter,
    filteredUsers,
    filteredListings,
  } = useAdminSearchFilters(users, listings);

  // Current user
  const currentUserId = useCurrentAdminUser();

  // Core admin actions (promote, demote, verification, content moderation)
  const {
    promoteAdmin,
    demoteAdmin,
    toggleVerifiedStatus,
    toggleTraderStatus,
    handleApproveItem,
    handleRejectItem,
    handleSuspendUser,
    handleUnsuspendUser,
  } = useAdminActions(setUsers, setListings, setReports, startOperation, finishOperation);

  // Enhanced role operations with toast management
  const {
    enhancedPromoteAdmin,
    enhancedDemoteAdmin,
    enhancedToggleVerifiedStatus
  } = useEnhancedRoleOperations(promoteAdmin, demoteAdmin, toggleVerifiedStatus, refetchUsers);

  // Error handling
  useEffect(() => {
    const combinedError = usersError || listingsError || reportsError;
    if (combinedError) {
      console.error("Admin data error:", combinedError);
      setFetchError(combinedError instanceof Error ? combinedError.message : String(combinedError));
    } else {
      setFetchError(null);
    }
  }, [usersError, listingsError, reportsError]);

  return {
    users, setUsers,
    listings, setListings,
    reports, setReports,
    reportedItems: reports,
    stats, analyticsData, setStats,
    loading: loadingUsers || loadingListings || loadingReports,
    isLoadingAnalytics,
    analyticsError,
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
    toggleTraderStatus,
    currentUserId,
    fetchError,
    refetchData,
    pendingOperations,
    isPendingForUser,
    isRefetching
  };
}
