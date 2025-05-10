
import { useCallback } from "react";
import { useAdminOperationToasts } from "./useAdminOperationToasts";

export function useEnhancedRoleOperations(
  promoteAdmin: (userId: string) => Promise<any>,
  demoteAdmin: (userId: string) => Promise<any>, 
  toggleVerifiedStatus: (userId: string, currentStatus: "verified" | "unverified") => Promise<any>,
  refetchUsers: () => Promise<void>
) {
  const { handleRoleOperationWithRefresh } = useAdminOperationToasts();

  const enhancedPromoteAdmin = useCallback(async (userId: string) => {
    console.log("Starting enhanced promote admin operation for user:", userId);
    const result = await handleRoleOperationWithRefresh(promoteAdmin, userId);
    console.log("Enhanced promote admin operation result:", result);
    
    if (result.success && result.refreshRequired) {
      console.log("Refreshing users after promote admin operation");
      await refetchUsers();
    }
    return result.result;
  }, [handleRoleOperationWithRefresh, promoteAdmin, refetchUsers]);
  
  const enhancedDemoteAdmin = useCallback(async (userId: string) => {
    console.log("Starting enhanced demote admin operation for user:", userId);
    const result = await handleRoleOperationWithRefresh(demoteAdmin, userId);
    console.log("Enhanced demote admin operation result:", result);
    
    if (result.success && result.refreshRequired) {
      console.log("Refreshing users after demote admin operation");
      await refetchUsers();
    }
    return result.result;
  }, [handleRoleOperationWithRefresh, demoteAdmin, refetchUsers]);
  
  const enhancedToggleVerifiedStatus = useCallback(async (userId: string, currentStatus: "verified" | "unverified") => {
    console.log(`Starting enhanced toggle verified status operation for user: ${userId}, current status: ${currentStatus}`);
    const result = await handleRoleOperationWithRefresh(toggleVerifiedStatus, userId, currentStatus);
    console.log("Enhanced toggle verified status operation result:", result);
    
    if (result.success && result.refreshRequired) {
      console.log("Refreshing users after toggle verified status operation");
      await refetchUsers();
    }
    return result.result;
  }, [handleRoleOperationWithRefresh, toggleVerifiedStatus, refetchUsers]);

  return {
    enhancedPromoteAdmin,
    enhancedDemoteAdmin,
    enhancedToggleVerifiedStatus
  };
}
