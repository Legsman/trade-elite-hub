
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users, FileText, AlertTriangle, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

interface OverviewTabProps {
  stats: {
    totalUsers: number;
    newUsersToday: number;
    activeListings: number;
    pendingListings: number;
    reportedContent: number;
  };
  analyticsData: any[];
  listings: any[];
  reportedItems: any[];
  formatDate: (dateString: string) => string;
  handleApproveItem: (id: string, type: string) => void;
  handleRejectItem: (id: string, type: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  stats,
  analyticsData,
  listings,
  reportedItems,
  formatDate,
  handleApproveItem,
  handleRejectItem,
}) => (
  <div className="space-y-6">
    {/* Stats Row */}
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            <span className="text-green-500 font-medium mr-1">+{stats.newUsersToday}</span> new today
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Listings</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeListings}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            <span className="font-medium mr-1">{stats.pendingListings}</span> pending approval
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reports</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.reportedContent}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            Requires attention
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Analytics Chart */}
    <Card>
      <CardHeader>
        <CardTitle>Platform Growth</CardTitle>
        <CardDescription>User registrations, listings, and messages over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={analyticsData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="users" stackId="1" stroke="#8884d8" fill="#8884d8" />
              <Area type="monotone" dataKey="listings" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
              <Area type="monotone" dataKey="messages" stackId="3" stroke="#ffc658" fill="#ffc658" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>

    {/* Recent Activity and Pending Tasks */}
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {listings.slice(0, 5).map((listing) => (
              <div key={listing.id} className="flex items-center">
                <div className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <p className="text-sm">
                    New listing: <span className="font-medium">{listing.title}</span> by {listing.seller_name}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(listing.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Pending Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {listings.filter(l => l.status === 'pending').map((listing) => (
              <div key={listing.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Approve listing: {listing.title}</p>
                  <p className="text-xs text-muted-foreground">From {listing.seller_name}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleApproveItem(listing.id, 'listing')}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleRejectItem(listing.id, 'listing')}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {reportedItems.filter(r => r.status === 'pending').map((report) => (
              <div key={report.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Review report: {report.reason}</p>
                  <p className="text-xs text-muted-foreground">For {report.item_title}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleApproveItem(report.id, 'report')}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleRejectItem(report.id, 'report')}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {listings.filter(l => l.status === 'pending').length === 0 &&
              reportedItems.filter(r => r.status === 'pending').length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No pending tasks at the moment
                </p>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default OverviewTab;
