
import MainLayout from "@/components/layout/MainLayout";
import { Shield, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewTab from "./OverviewTab";
import UsersTab from "./UsersTab";
import ListingsTab from "./ListingsTab";
import ReportsTab from "./ReportsTab";
import AdminsTab from "./AdminsTab";
import { Loading } from "@/components/ui/loading";
import { useAdminDashboard } from "./useAdminDashboard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { formatDate } from "@/utils/adminUtils"; // Import formatDate from utils

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    loading,
    fetchError,
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
    users,
    promoteAdmin,
    demoteAdmin,
    currentUserId,
    refetchData
  } = useAdminDashboard();

  // Redirect to /admin if on root path
  useEffect(() => {
    if (location.pathname === "/") {
      navigate("/admin", { replace: true });
    }
  }, [location.pathname, navigate]);

  // By default, if you're in the admin panel, you should be an admin
  const isAdmin = true;

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-12">
          <Loading message="Loading administrative data..." />
        </div>
      </MainLayout>
    );
  }

  if (fetchError) {
    console.error("Admin dashboard error:", fetchError);
    return (
      <MainLayout>
        <div className="container py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading admin data</AlertTitle>
            <AlertDescription>
              {typeof fetchError === 'string' ? fetchError : 'An unexpected error occurred'}. 
              This is likely due to a database or permissions issue in development mode.
            </AlertDescription>
          </Alert>
          <div className="mt-4 space-x-4">
            <Button onClick={() => refetchData()}>
              Try Again
            </Button>
            <Button variant="outline" onClick={() => {
              // Force development mode for admin data
              localStorage.setItem('dev_admin_mode', 'true');
              window.location.reload();
            }}>
              Enable Dev Mode
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Provide fallback data if any of the required data is missing
  const safeStats = stats || {
    totalUsers: 0,
    newUsersToday: 0,
    activeListings: 0,
    pendingListings: 0,
    totalMessages: 0,
    reportedContent: 0,
  };
  
  const safeUsers = users || [];
  const safeListings = listings || [];
  const safeReportedItems = reportedItems || [];
  const safeAnalyticsData = analyticsData || [];

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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="admins">Admin Users</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab
              stats={safeStats}
              analyticsData={safeAnalyticsData}
              listings={safeListings}
              reportedItems={safeReportedItems}
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
              reportedItems={safeReportedItems}
              formatDate={formatDate}
              handleApproveItem={handleApproveItem}
              handleRejectItem={handleRejectItem}
            />
          </TabsContent>
          
          <TabsContent value="admins">
            <AdminsTab
              users={safeUsers}
              promoteAdmin={promoteAdmin}
              demoteAdmin={demoteAdmin}
              currentUserId={currentUserId}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
