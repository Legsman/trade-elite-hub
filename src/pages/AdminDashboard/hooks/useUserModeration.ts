
import { useCallback } from "react";
import { UserAdmin } from "../types";
import { useAdminToastManager } from "@/hooks/useAdminToastManager";

export function useUserModeration(
  setUsers: React.Dispatch<React.SetStateAction<UserAdmin[]>>
) {
  const { toast } = useAdminToastManager();

  const handleSuspendUser = useCallback((id: string) => {
    setUsers((prev: UserAdmin[]) =>
      prev.map(user => user.id === id ? { ...user, strike_count: 3 } : user)
    );
    
    toast.success({
      title: "User suspended",
      description: "The user has been suspended",
    });
  }, [setUsers, toast]);

  const handleUnsuspendUser = useCallback((id: string) => {
    setUsers((prev: UserAdmin[]) =>
      prev.map(user => user.id === id ? { ...user, strike_count: 0 } : user)
    );
    
    toast.success({
      title: "User unsuspended",
      description: "The user has been unsuspended and can now use the platform again",
    });
  }, [setUsers, toast]);

  return {
    handleSuspendUser,
    handleUnsuspendUser,
  };
}
