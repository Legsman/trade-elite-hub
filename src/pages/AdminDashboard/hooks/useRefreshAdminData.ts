
import { useCallback, useState } from "react";
import { useAdminToastManager } from "@/hooks/useAdminToastManager";

export function useRefreshAdminData(refetchUsers: () => Promise<void>) {
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const { toast } = useAdminToastManager();

  const refetchData = useCallback(async () => {
    try {
      if (isRefetching) {
        console.log("Already refetching data, request ignored");
        return;
      }
      
      const refreshToastId = "refresh_data";
      setIsRefetching(true);
      
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
      
      toast.error({
        title: "Error Refreshing Data",
        description: "Please try again or contact support",
        id: "refresh_data"
      });
    } finally {
      setIsRefetching(false);
    }
  }, [refetchUsers, isRefetching, toast]);

  return {
    refetchData,
    isRefetching,
    setIsRefetching
  };
}
