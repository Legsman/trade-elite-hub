
import { createContext, useContext } from "react";
import { AdminStats, ListingAdmin, ReportAdmin, UserAdmin } from "../types";

interface AdminDashboardContextType {
  stats: AdminStats;
  analyticsData: any[];
  listings: ListingAdmin[];
  reports: ReportAdmin[];
  users: UserAdmin[];
  formatDate: (dateString: string) => string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  userFilter: string;
  setUserFilter: (f: string) => void;
  listingFilter: string;
  setListingFilter: (f: string) => void;
  filteredUsers: UserAdmin[];
  filteredListings: ListingAdmin[];
  handleApproveItem: (id: string, type: string) => void;
  handleRejectItem: (id: string, type: string) => void;
  handleSuspendUser: (id: string) => void;
  handleUnsuspendUser: (id: string) => void;
  promoteAdmin: (userId: string) => void;
  demoteAdmin: (userId: string) => void;
  toggleVerifiedStatus: (userId: string, currentStatus: "verified" | "unverified") => void;
  currentUserId: string;
  isPendingForUser?: (userId: string) => boolean;
  isRefetching?: boolean;
  onRefresh?: () => Promise<void>;
}

export const AdminDashboardContext = createContext<AdminDashboardContextType | undefined>(undefined);

export function useAdminDashboardContext() {
  const context = useContext(AdminDashboardContext);
  if (!context) {
    throw new Error("useAdminDashboardContext must be used within an AdminDashboardProvider");
  }
  return context;
}

export function AdminDashboardProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: AdminDashboardContextType;
}) {
  return (
    <AdminDashboardContext.Provider value={value}>
      {children}
    </AdminDashboardContext.Provider>
  );
}
