
import MainLayout from "@/components/layout/MainLayout";
import { Shield } from "lucide-react";
import { useAdminDashboard } from "./AdminDashboard/useAdminDashboard";
import AdminTabsLayout from "./AdminDashboard/AdminTabsLayout";

const AdminDashboard = () => {
  const {
    users,
    listings,
    reports,
    stats,
    analyticsData,
    loading,
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
        />
      </div>
    </MainLayout>
  );
};
export default AdminDashboard;
