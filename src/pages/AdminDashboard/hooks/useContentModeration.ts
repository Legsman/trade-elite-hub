
import { ListingAdmin, ReportAdmin, UserAdmin } from "../types";
import { useUserModeration } from "./useUserModeration";
import { useListingModeration } from "./useListingModeration";

export function useContentModeration(
  setUsers: React.Dispatch<React.SetStateAction<UserAdmin[]>>,
  setListings: React.Dispatch<React.SetStateAction<ListingAdmin[]>>,
  setReports: React.Dispatch<React.SetStateAction<ReportAdmin[]>>
) {
  const { handleSuspendUser, handleUnsuspendUser } = useUserModeration(setUsers);
  const { handleApproveItem, handleRejectItem } = useListingModeration(setListings, setReports);

  return {
    handleApproveItem,
    handleRejectItem,
    handleSuspendUser,
    handleUnsuspendUser,
  };
}
