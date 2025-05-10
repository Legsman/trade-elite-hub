
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
