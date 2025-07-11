
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAdmin, ListingAdmin, ReportAdmin, AdminStats, AnalyticsDataPoint } from "./types";
import OverviewTab from "./tabs/OverviewTab";
import UsersTab from "./tabs/UsersTab";
import ListingsTab from "./tabs/ListingsTab";
import ReportsTab from "./tabs/ReportsTab";
import AdminsTab from "./tabs/AdminsTab";
import { AdminDashboardProvider } from "./context/AdminDashboardContext";

interface AdminTabsLayoutProps {
  stats: AdminStats;
  analyticsData: AnalyticsDataPoint[];
  listings: ListingAdmin[];
  reports: ReportAdmin[];
  users: UserAdmin[];
  formatDate: (date: string) => string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userFilter: string;
  setUserFilter: (filter: string) => void;
  listingFilter: string;
  setListingFilter: (filter: string) => void;
  filteredUsers: UserAdmin[];
  filteredListings: ListingAdmin[];
  handleApproveItem: (id: string, type: string) => void;
  handleRejectItem: (id: string, type: string) => void;
  handleSuspendUser: (userId: string) => void;
  handleUnsuspendUser: (userId: string) => void;
  promoteAdmin: (userId: string) => void;
  demoteAdmin: (userId: string) => void;
  toggleVerifiedStatus: (userId: string, currentStatus: "verified" | "unverified" | "trader") => void;
  toggleTraderStatus: (userId: string, currentStatus: "verified" | "trader") => void;
  currentUserId: string;
  isPendingForUser: (id: string) => boolean;
  isRefetching: boolean;
  onRefresh: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLoadingAnalytics?: boolean;
  analyticsError?: string | null;
}

const AdminTabsLayout: React.FC<AdminTabsLayoutProps> = ({
  stats,
  analyticsData,
  listings,
  reports,
  users,
  formatDate,
  searchQuery,
  setSearchQuery,
  userFilter,
  setUserFilter,
  listingFilter,
  setListingFilter,
  filteredUsers,
  filteredListings,
  handleApproveItem,
  handleRejectItem,
  handleSuspendUser,
  handleUnsuspendUser,
  promoteAdmin,
  demoteAdmin,
  toggleVerifiedStatus,
  toggleTraderStatus,
  currentUserId,
  isPendingForUser,
  isRefetching,
  onRefresh,
  activeTab,
  setActiveTab,
  isLoadingAnalytics,
  analyticsError,
}) => {
  // Create a common context value object that contains all props needed by all tabs
  const contextValue = {
    users,
    listings,
    reports,
    stats,
    analyticsData,
    formatDate,
    handleApproveItem,
    handleRejectItem,
    isLoadingAnalytics,
    analyticsError,
    searchQuery,
    setSearchQuery,
    userFilter,
    setUserFilter,
    listingFilter,
    setListingFilter,
    filteredUsers,
    filteredListings,
    handleSuspendUser,
    handleUnsuspendUser,
    promoteAdmin,
    demoteAdmin,
    toggleVerifiedStatus,
    toggleTraderStatus,
    currentUserId,
    isPendingForUser,
    isRefetching,
    onRefresh
  };

  return (
    <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="w-full border-b pb-0">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="listings">Listings</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="admins">Admins</TabsTrigger>
      </TabsList>
      
      <AdminDashboardProvider {...contextValue}>
        <TabsContent value="overview" className="py-2">
          <OverviewTab />
        </TabsContent>
        
        <TabsContent value="users" className="py-2">
          <UsersTab />
        </TabsContent>
        
        <TabsContent value="listings" className="py-2">
          <ListingsTab />
        </TabsContent>
        
        <TabsContent value="reports" className="py-2">
          <ReportsTab />
        </TabsContent>
        
        <TabsContent value="admins" className="py-2">
          <AdminsTab />
        </TabsContent>
      </AdminDashboardProvider>
    </Tabs>
  );
};

export default AdminTabsLayout;
