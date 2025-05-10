
import { useCallback } from "react";
import { useAdminToastManager } from "@/hooks/useAdminToastManager";
import { useUserModeration } from "./useUserModeration";
import { useListingModeration } from "./useListingModeration";
import { UserAdmin, ListingAdmin, ReportAdmin } from "../types";

export function useContentModeration(
  setUsers: React.Dispatch<React.SetStateAction<UserAdmin[]>>,
  setListings: React.Dispatch<React.SetStateAction<ListingAdmin[]>>,
  setReports: React.Dispatch<React.SetStateAction<ReportAdmin[]>>
) {
  const { toast } = useAdminToastManager();

  const { handleSuspendUser, handleUnsuspendUser } = useUserModeration(setUsers);
  const { handleApproveItem, handleRejectItem } = useListingModeration(setListings, setReports);

  return {
    handleApproveItem,
    handleRejectItem,
    handleSuspendUser,
    handleUnsuspendUser,
  };
}
