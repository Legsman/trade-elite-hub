
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import OverviewTab from "./OverviewTab";
import UsersTab from "./UsersTab";
import ListingsTab from "./ListingsTab";
import ReportsTab from "./ReportsTab";
import AdminsTab from "./AdminsTab";
import { AdminStats, ListingAdmin, ReportAdmin, UserAdmin } from "./types";

type AdminTabsLayoutProps = {
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
  activeTab?: string; // Added to remember active tab
  setActiveTab?: (tab: string) => void; // Added to update active tab
};

export function AdminTabsLayout({
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
  currentUserId,
  isPendingForUser,
  isRefetching,
  onRefresh,
  activeTab = "overview", 
  setActiveTab,
}: AdminTabsLayoutProps) {
  // Internal tab state if no external state is provided
  const [internalActiveTab, setInternalActiveTab] = useState(activeTab);
  
  // Use either the provided setter or the internal one
  const handleTabChange = (value: string) => {
    if (setActiveTab) {
      setActiveTab(value);
    } else {
      setInternalActiveTab(value);
    }
  };

  // Sync internal state with external state if provided
  useEffect(() => {
    if (activeTab && activeTab !== internalActiveTab) {
      setInternalActiveTab(activeTab);
    }
  }, [activeTab]);

  // The active tab value to use in the component
  const currentTab = setActiveTab ? activeTab : internalActiveTab;

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="listings">Listings</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="admins">Admins</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <OverviewTab
          stats={stats}
          analyticsData={analyticsData}
          listings={listings}
          reportedItems={reports}
          formatDate={formatDate}
          handleApproveItem={handleApproveItem}
          handleRejectItem={handleRejectItem}
        />
      </TabsContent>
      <TabsContent value="users">
        <UsersTab
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          userFilter={userFilter}
          setUserFilter={setUserFilter}
          filteredUsers={filteredUsers}
          formatDate={formatDate}
          handleSuspendUser={handleSuspendUser}
          handleUnsuspendUser={handleUnsuspendUser}
          toggleVerifiedStatus={toggleVerifiedStatus}
          isPendingForUser={isPendingForUser}
          isRefetching={isRefetching}
          onRefresh={onRefresh}
        />
      </TabsContent>
      <TabsContent value="listings">
        <ListingsTab
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          listingFilter={listingFilter}
          setListingFilter={setListingFilter}
          filteredListings={filteredListings}
          formatDate={formatDate}
          handleApproveItem={handleApproveItem}
          handleRejectItem={handleRejectItem}
        />
      </TabsContent>
      <TabsContent value="reports">
        <ReportsTab
          reportedItems={reports}
          formatDate={formatDate}
          handleApproveItem={handleApproveItem}
          handleRejectItem={handleRejectItem}
        />
      </TabsContent>
      <TabsContent value="admins">
        <AdminsTab
          users={users}
          promoteAdmin={promoteAdmin}
          demoteAdmin={demoteAdmin}
          currentUserId={currentUserId}
          isPendingForUser={isPendingForUser}
          isRefetching={isRefetching}
        />
      </TabsContent>
    </Tabs>
  );
}

export default AdminTabsLayout;
