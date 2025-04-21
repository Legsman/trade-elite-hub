
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewTab from "./OverviewTab";
import UsersTab from "./UsersTab";
import ListingsTab from "./ListingsTab";
import ReportsTab from "./ReportsTab";
import { AdminStats, ListingAdmin, ReportAdmin, UserAdmin } from "./types";

type AdminTabsLayoutProps = {
  stats: AdminStats;
  analyticsData: any[];
  listings: ListingAdmin[];
  reports: ReportAdmin[];
  users: UserAdmin[];
};

export function AdminTabsLayout({
  stats,
  analyticsData,
  listings,
  reports,
  users,
}: AdminTabsLayoutProps) {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="listings">Listings</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <OverviewTab
          stats={stats}
          analyticsData={analyticsData}
          listings={listings}
          reportedItems={reports}
        />
      </TabsContent>
      <TabsContent value="users">
        <UsersTab users={users} />
      </TabsContent>
      <TabsContent value="listings">
        <ListingsTab listings={listings} />
      </TabsContent>
      <TabsContent value="reports">
        <ReportsTab reportedItems={reports} />
      </TabsContent>
    </Tabs>
  );
}
export default AdminTabsLayout;
