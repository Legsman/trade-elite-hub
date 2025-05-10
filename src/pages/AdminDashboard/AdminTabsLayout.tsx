
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import OverviewTab from "./tabs/OverviewTab";
import UsersTab from "./tabs/UsersTab";
import ListingsTab from "./tabs/ListingsTab";
import ReportsTab from "./tabs/ReportsTab";
import AdminsTab from "./tabs/AdminsTab";
import { AdminDashboardProvider } from "./context/AdminDashboardContext";
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
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
};

export function AdminTabsLayout(props: AdminTabsLayoutProps) {
  const {
    activeTab = "overview",
    setActiveTab,
  } = props;

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
  }, [activeTab, internalActiveTab]);

  // The active tab value to use in the component
  const currentTab = setActiveTab ? activeTab : internalActiveTab;

  return (
    <AdminDashboardProvider value={props}>
      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="admins">Admins</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
        <TabsContent value="listings">
          <ListingsTab />
        </TabsContent>
        <TabsContent value="reports">
          <ReportsTab />
        </TabsContent>
        <TabsContent value="admins">
          <AdminsTab />
        </TabsContent>
      </Tabs>
    </AdminDashboardProvider>
  );
}

export default AdminTabsLayout;
