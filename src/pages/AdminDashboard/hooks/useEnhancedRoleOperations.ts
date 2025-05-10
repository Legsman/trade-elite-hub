
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
    const result = await handleRoleOperationWithRefresh(promoteAdmin, userId);
    if (result.success && result.refreshRequired) {
      await refetchUsers();
    }
    return result.result;
  }, [handleRoleOperationWithRefresh, promoteAdmin, refetchUsers]);
  
  const enhancedDemoteAdmin = useCallback(async (userId: string) => {
    const result = await handleRoleOperationWithRefresh(demoteAdmin, userId);
    if (result.success && result.refreshRequired) {
      await refetchUsers();
    }
    return result.result;
  }, [handleRoleOperationWithRefresh, demoteAdmin, refetchUsers]);
  
  const enhancedToggleVerifiedStatus = useCallback(async (userId: string, currentStatus: "verified" | "unverified") => {
    const result = await handleRoleOperationWithRefresh(toggleVerifiedStatus, userId, currentStatus);
    if (result.success && result.refreshRequired) {
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
