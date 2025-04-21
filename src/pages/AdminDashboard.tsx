
import MainLayout from "@/components/layout/MainLayout";
import { Shield } from "lucide-react";
import { useAdminDashboard } from "./AdminDashboard/useAdminDashboard";
import AdminTabsLayout from "./AdminDashboard/AdminTabsLayout";
import { formatDate } from "@/utils/adminUtils";

const AdminDashboard = () => {
  const {
    users,
    listings,
    reports, // Use reports rather than reportedItems
    stats,
    analyticsData,
    loading,
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
    filteredListings
  } = useAdminDashboard();

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-12">
          <div>Loading administrative data...</div>
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
        <AdminTabsLayout
          stats={stats}
          analyticsData={analyticsData}
          listings={listings}
          reports={reports}
          users={users}
          formatDate={formatDate}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          userFilter={userFilter}
          setUserFilter={setUserFilter}
          listingFilter={listingFilter}
          setListingFilter={setListingFilter}
          filteredUsers={filteredUsers}
          filteredListings={filteredListings}
          handleApproveItem={handleApproveItem}
          handleRejectItem={handleRejectItem}
          handleSuspendUser={handleSuspendUser}
          handleUnsuspendUser={handleUnsuspendUser}
        />
      </div>
    </MainLayout>
  );
};
export default AdminDashboard;
