
import { useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { UserAdmin } from "../types";

export function useUserModeration(
  setUsers: React.Dispatch<React.SetStateAction<UserAdmin[]>>
) {
  const handleSuspendUser = useCallback((id: string) => {
    setUsers((prev: UserAdmin[]) =>
      prev.map(user => user.id === id ? { ...user, strike_count: 3 } : user)
    );
    toast({
      title: "User suspended",
      description: "The user has been suspended",
    });
  }, [setUsers]);

  const handleUnsuspendUser = useCallback((id: string) => {
    setUsers((prev: UserAdmin[]) =>
      prev.map(user => user.id === id ? { ...user, strike_count: 0 } : user)
    );
    toast({
      title: "User unsuspended",
      description: "The user has been unsuspended and can now use the platform again",
    });
  }, [setUsers]);

  return {
    handleSuspendUser,
    handleUnsuspendUser,
  };
}
