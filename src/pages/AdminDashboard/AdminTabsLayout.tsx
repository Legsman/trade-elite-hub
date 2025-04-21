import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  loadingUserId?: string | null;
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
  loadingUserId,
}: AdminTabsLayoutProps) {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
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
          loadingUserId={loadingUserId}
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
          loadingUserId={loadingUserId}
        />
      </TabsContent>
    </Tabs>
  );
}

export default AdminTabsLayout;
