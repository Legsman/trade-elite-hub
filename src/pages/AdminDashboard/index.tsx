
import MainLayout from "@/components/layout/MainLayout";
import { Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewTab from "./OverviewTab";
import UsersTab from "./UsersTab";
import ListingsTab from "./ListingsTab";
import ReportsTab from "./ReportsTab";
import { Loading } from "@/components/ui/loading";
import { useAdminDashboard } from "./useAdminDashboard";
import { formatDate } from "./adminUtils";

const AdminDashboard = () => {
  const {
    loading,
    stats,
    analyticsData,
    listings,
    reportedItems,
    searchQuery,
    setSearchQuery,
    userFilter,
    setUserFilter,
    listingFilter,
    setListingFilter,
    handleApproveItem,
    handleRejectItem,
    handleSuspendUser,
    handleUnsuspendUser,
    filteredUsers,
    filteredListings,
  } = useAdminDashboard();

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-12">
          <Loading message="Loading administrative data..." />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
          <div className="flex items-center">
            <Shield className="h-8 w-8 mr-3 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Monitor and manage platform activity
              </p>
            </div>
          </div>
        </div>

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
              reportedItems={reportedItems}
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
              reportedItems={reportedItems}
              formatDate={formatDate}
              handleApproveItem={handleApproveItem}
              handleRejectItem={handleRejectItem}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
