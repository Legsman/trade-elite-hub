
import React, { createContext, useContext } from 'react';
import { UserAdmin, ListingAdmin, ReportAdmin, AdminStats, AnalyticsDataPoint } from '../types';

interface AdminDashboardContextType {
  users: UserAdmin[];
  listings: ListingAdmin[];
  reports: ReportAdmin[];
  stats: AdminStats;
  analyticsData: AnalyticsDataPoint[];
  formatDate: (dateString: string) => string;
  handleApproveItem: (id: string, type: string) => void;
  handleRejectItem: (id: string, type: string) => void;
  isLoadingAnalytics?: boolean;
  analyticsError?: string | null;
  
  // Additional properties for AdminsTab
  promoteAdmin: (userId: string) => void;
  demoteAdmin: (userId: string) => void;
  currentUserId: string;
  isPendingForUser: (userId: string) => boolean;
  isRefetching?: boolean;
  
  // Additional properties for UsersTab
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  userFilter?: string;
  setUserFilter?: (filter: string) => void;
  filteredUsers?: UserAdmin[];
  handleSuspendUser?: (userId: string) => void;
  handleUnsuspendUser?: (userId: string) => void;
  toggleVerifiedStatus?: (userId: string, currentStatus: "verified" | "unverified") => void;
  onRefresh?: () => void;
  
  // Additional properties for ListingsTab
  listingFilter?: string;
  setListingFilter?: (filter: string) => void;
  filteredListings?: ListingAdmin[];
}

const AdminDashboardContext = createContext<AdminDashboardContextType | undefined>(undefined);

export const useAdminDashboardContext = () => {
  const context = useContext(AdminDashboardContext);
  if (context === undefined) {
    throw new Error("useAdminDashboardContext must be used within an AdminDashboardProvider");
  }
  return context;
};

export const AdminDashboardProvider: React.FC<AdminDashboardContextType & { children: React.ReactNode }> = ({
  children,
  ...contextValues
}) => (
  <AdminDashboardContext.Provider value={contextValues}>{children}</AdminDashboardContext.Provider>
);
