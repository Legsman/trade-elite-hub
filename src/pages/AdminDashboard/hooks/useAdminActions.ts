
import { UserAdmin, ListingAdmin, ReportAdmin } from "../types";
import { useAdminRoleManagement } from "./useAdminRoleManagement";
import { useVerificationManagement } from "./useVerificationManagement";
import { useContentModeration } from "./useContentModeration";

export function useAdminActions(
  setUsers: React.Dispatch<React.SetStateAction<UserAdmin[]>>,
  setListings: React.Dispatch<React.SetStateAction<ListingAdmin[]>>,
  setReports: React.Dispatch<React.SetStateAction<ReportAdmin[]>>
) {
  const { promoteAdmin, demoteAdmin, loadingUserId } = useAdminRoleManagement(setUsers);
  const { toggleVerifiedStatus } = useVerificationManagement(setUsers);
  const {
    handleApproveItem,
    handleRejectItem,
    handleSuspendUser,
    handleUnsuspendUser,
  } = useContentModeration(setUsers, setListings, setReports);

  return {
    promoteAdmin,
    demoteAdmin,
    toggleVerifiedStatus,
    handleApproveItem,
    handleRejectItem,
    handleSuspendUser,
    handleUnsuspendUser,
    loadingUserId,
  };
}
