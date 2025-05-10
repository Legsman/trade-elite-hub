
import { UserAdmin, ListingAdmin, ReportAdmin } from "../types";
import { useAdminRoleManagement } from "./useAdminRoleManagement";
import { useVerificationManagement } from "./useVerificationManagement";
import { useContentModeration } from "./useContentModeration";

export function useAdminActions(
  setUsers: React.Dispatch<React.SetStateAction<UserAdmin[]>>,
  setListings: React.Dispatch<React.SetStateAction<ListingAdmin[]>>,
  setReports: React.Dispatch<React.SetStateAction<ReportAdmin[]>>
) {
  const { 
    promoteAdmin, 
    demoteAdmin, 
    pendingOperations: rolePendingOperations,
    isPendingForUser: isRoleOperationPending 
  } = useAdminRoleManagement(setUsers);
  
  const { 
    toggleVerifiedStatus, 
    pendingUserIds: verificationPendingUserIds 
  } = useVerificationManagement(setUsers);
  
  const {
    handleApproveItem,
    handleRejectItem,
    handleSuspendUser,
    handleUnsuspendUser,
  } = useContentModeration(setUsers, setListings, setReports);

  // Combine pending operations from different hooks
  const isPendingForUser = (userId: string) => {
    return (
      isRoleOperationPending(userId) || 
      verificationPendingUserIds.includes(userId)
    );
  };

  return {
    promoteAdmin,
    demoteAdmin,
    toggleVerifiedStatus,
    handleApproveItem,
    handleRejectItem,
    handleSuspendUser,
    handleUnsuspendUser,
    loadingUserId: null, // Deprecated, use pendingOperations instead
    pendingOperations: rolePendingOperations,
    isPendingForUser
  };
}
