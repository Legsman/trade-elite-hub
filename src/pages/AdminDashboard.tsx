
import { ReactNode } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { RefreshCw, Shield } from "lucide-react";
import { useAdminDashboard } from "./AdminDashboard/useAdminDashboard";
import AdminTabsLayout from "./AdminDashboard/AdminTabsLayout";
import { formatDate } from "@/utils/adminUtils";
import { Loading } from "@/components/ui/loading";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const {
    users,
    listings,
    reports,
    stats,
    analyticsData,
    loading,
    fetchError,
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
    promoteAdmin,
    demoteAdmin,
    toggleVerifiedStatus,
    currentUserId,
    refetchData,
    isPendingForUser,
    isRefetching
  } = useAdminDashboard();

  if (loading && !isRefetching) {
    return (
      <MainLayout>
        <div className="container py-12 flex flex-col items-center justify-center min-h-[60vh]">
          <Loading size={32} message="Loading administrative data..." />
        </div>
      </MainLayout>
    );
  }

  if (fetchError) {
    return (
      <MainLayout>
        <div className="container py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading admin data</AlertTitle>
            <AlertDescription>
              {fetchError || 'An unexpected error occurred'}. 
              Please try again or contact system support.
            </AlertDescription>
          </Alert>
          <div className="mt-4 space-x-4">
            <Button onClick={() => refetchData()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </div>
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
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refetchData} 
            disabled={isRefetching}
            className="flex items-center gap-1"
          >
            {isRefetching ? (
              <>
                <Loading size={16} message="Refreshing data..." />
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh Data
              </>
            )}
          </Button>
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
          promoteAdmin={promoteAdmin}
          demoteAdmin={demoteAdmin}
          toggleVerifiedStatus={toggleVerifiedStatus}
          currentUserId={currentUserId}
          isPendingForUser={isPendingForUser}
          isRefetching={isRefetching}
          onRefresh={refetchData}
        />
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
