import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Users, BarChart2, FileText, AlertTriangle, Check, X, Search } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loading } from "@/components/ui/loading";
import { toast } from "@/hooks/use-toast";
import {
  AreaChart,
  Area,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersToday: 0,
    activeListings: 0,
    pendingListings: 0,
    totalMessages: 0,
    reportedContent: 0,
  });
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [reportedItems, setReportedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [listingFilter, setListingFilter] = useState("all");
  const [analyticsData, setAnalyticsData] = useState([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch real users from 'profiles' table
      let { data: usersRaw, error: usersError } = await supabase
        .from("profiles")
        .select("id, full_name, email, created_at, strike_count, is_two_factor_enabled, feedback_rating");

      if (usersError) throw usersError;
      // Fetch user roles
      let { data: rolesRaw, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");
      if (rolesError) throw rolesError;

      // Fetch listings from 'listings' table
      let { data: listingsRaw, error: listingsError } = await supabase
        .from("listings")
        .select("id, title, seller_id, price, category, status, created_at, views, saves");
      if (listingsError) throw listingsError;

      // Map user_id to role
      const userRolesMap = new Map();
      rolesRaw.forEach(({ user_id, role }) => {
        userRolesMap.set(user_id, role);
      });

      // Finalize users with role, add a mock last_login and listings_count (real: count listings by user)
      const usersData = (usersRaw || []).map(profile => {
        const listings_count = (listingsRaw || []).filter(l => l.seller_id === profile.id).length;
        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          created_at: profile.created_at,
          role: userRolesMap.get(profile.id) || "user",
          strike_count: profile.strike_count || 0,
          status: profile.strike_count >= 3 ? "suspended" : profile.strike_count === 2 ? "warning" : "active",
          listings_count,
          last_login: null, // TODO: Pull from 'auth' via useProfileService, not possible directly from profiles
        };
      });

      // Get sellers' names for listing mapping
      const userIdToName = {};
      for (const user of usersRaw) {
        userIdToName[user.id] = user.full_name;
      }

      // Map listings with seller_name
      const listingsData = (listingsRaw || []).map(listing => ({
        ...listing,
        seller_name: userIdToName[listing.seller_id] || "Unknown",
      }));

      // (There is no universal reported items table. We'll treat 'strike_count' >=2 or status='suspended' as "reports" for demo)
      const reported = usersData
        .filter(u => u.strike_count > 0)
        .map((u, i) => ({
          id: String(i + 1),
          type: "user",
          item_id: u.id,
          item_title: `User: ${u.full_name}`,
          reporter_name: "System",
          reporter_id: "",
          reason: u.strike_count >= 3 ? "Account suspended" : "Warning for user",
          status: u.strike_count >= 3 ? "pending" : "investigating",
          created_at: u.created_at,
        }));

      // Example analytics, just for demo - can improve if real stats are required:
      const now = new Date();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const analyticsData = monthNames.slice(0, 6).map((name, i) => ({
        name,
        users: Math.floor(usersData.length * ((i + 1) / 6)),
        listings: Math.floor(listingsData.length * ((i + 1) / 6)),
        messages: Math.floor(200 * (i + 1)),
      }));

      setUsers(usersData || []);
      setListings(listingsData || []);
      setReportedItems(reported);
      setAnalyticsData(analyticsData);

      // Stats:
      const today = now.toISOString().slice(0, 10);
      setStats({
        totalUsers: usersData.length,
        newUsersToday: usersData.filter(u => (u.created_at || "").slice(0, 10) === today).length,
        activeListings: listingsData.filter(l => l.status === "active").length,
        pendingListings: listingsData.filter(l => l.status === "pending").length,
        totalMessages: 0, // Implement this if you have a messages table
        reportedContent: reported.length,
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error loading admin data",
        description: "Failed to load administrative data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveItem = (id, type) => {
    // In a real app, this would update the status in the database
    if (type === 'listing') {
      setListings(prev => 
        prev.map(item => item.id === id ? { ...item, status: 'active' } : item)
      );
    } else if (type === 'report') {
      setReportedItems(prev => 
        prev.map(item => item.id === id ? { ...item, status: 'resolved' } : item)
      );
    }
    
    toast({
      title: "Item approved",
      description: `The ${type} has been approved successfully`,
    });
  };

  const handleRejectItem = (id, type) => {
    // In a real app, this would update the status in the database
    if (type === 'listing') {
      setListings(prev => 
        prev.map(item => item.id === id ? { ...item, status: 'rejected' } : item)
      );
    } else if (type === 'report') {
      setReportedItems(prev => 
        prev.map(item => item.id === id ? { ...item, status: 'dismissed' } : item)
      );
    }
    
    toast({
      title: "Item rejected",
      description: `The ${type} has been rejected`,
    });
  };

  const handleSuspendUser = (id) => {
    // In a real app, this would update the status in the database
    setUsers(prev => 
      prev.map(user => user.id === id ? { ...user, status: 'suspended' } : user)
    );
    
    toast({
      title: "User suspended",
      description: "The user has been suspended",
    });
  };

  const handleUnsuspendUser = (id) => {
    // In a real app, this would update the status in the database
    setUsers(prev => 
      prev.map(user => user.id === id ? { ...user, status: 'active', strike_count: 0 } : user)
    );
    
    toast({
      title: "User unsuspended",
      description: "The user has been unsuspended and can now use the platform again",
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (userFilter === 'all') return matchesSearch;
    if (userFilter === 'admin') return matchesSearch && user.role === 'admin';
    if (userFilter === 'active') return matchesSearch && user.status === 'active';
    if (userFilter === 'warning') return matchesSearch && user.status === 'warning';
    if (userFilter === 'suspended') return matchesSearch && user.status === 'suspended';
    
    return matchesSearch;
  });

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          listing.seller_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (listingFilter === 'all') return matchesSearch;
    if (listingFilter === 'active') return matchesSearch && listing.status === 'active';
    if (listingFilter === 'pending') return matchesSearch && listing.status === 'pending';
    if (listingFilter === 'suspended') return matchesSearch && listing.status === 'suspended';
    
    return matchesSearch;
  });

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

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Row */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Users
                  </CardTitle>
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
                  <CardTitle className="text-sm font-medium">
                    Listings
                  </CardTitle>
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
                  <CardTitle className="text-sm font-medium">
                    Reports
                  </CardTitle>
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
                <CardDescription>
                  User registrations, listings, and messages over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={analyticsData}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="users"
                        stackId="1"
                        stroke="#8884d8"
                        fill="#8884d8"
                      />
                      <Area
                        type="monotone"
                        dataKey="listings"
                        stackId="2"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                      />
                      <Area
                        type="monotone"
                        dataKey="messages"
                        stackId="3"
                        stroke="#ffc658"
                        fill="#ffc658"
                      />
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
                          <p className="text-xs text-muted-foreground">
                            {formatDate(listing.created_at)}
                          </p>
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
                          <p className="text-sm font-medium">
                            Approve listing: {listing.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            From {listing.seller_name}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproveItem(listing.id, 'listing')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectItem(listing.id, 'listing')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {reportedItems.filter(r => r.status === 'pending').map((report) => (
                      <div key={report.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            Review report: {report.reason}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            For {report.item_title}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproveItem(report.id, 'report')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectItem(report.id, 'report')}
                          >
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
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage user accounts on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-grow">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Listings</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6">
                            No users found matching your search criteria
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.full_name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  user.status === 'active'
                                    ? 'outline'
                                    : user.status === 'warning'
                                    ? 'secondary'
                                    : 'destructive'
                                }
                              >
                                {user.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(user.created_at)}</TableCell>
                            <TableCell>{user.listings_count}</TableCell>
                            <TableCell className="text-right">
                              {user.status === 'suspended' ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUnsuspendUser(user.id)}
                                >
                                  Unsuspend
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSuspendUser(user.id)}
                                  disabled={user.role === 'admin'}
                                >
                                  Suspend
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="listings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Listings Management</CardTitle>
                <CardDescription>
                  View and manage all listings on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-grow">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search listings..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={listingFilter} onValueChange={setListingFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Listings</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Seller</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredListings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6">
                            No listings found matching your search criteria
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredListings.map((listing) => (
                          <TableRow key={listing.id}>
                            <TableCell className="font-medium">{listing.title}</TableCell>
                            <TableCell>{listing.seller_name}</TableCell>
                            <TableCell>£{listing.price.toLocaleString()}</TableCell>
                            <TableCell className="capitalize">{listing.category}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  listing.status === 'active'
                                    ? 'default'
                                    : listing.status === 'pending'
                                    ? 'secondary'
                                    : 'destructive'
                                }
                              >
                                {listing.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(listing.created_at)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/listings/${listing.id}`)}
                                >
                                  View
                                </Button>
                                {listing.status === 'pending' && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleApproveItem(listing.id, 'listing')}
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleRejectItem(listing.id, 'listing')}
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {listing.status === 'active' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRejectItem(listing.id, 'listing')}
                                  >
                                    Suspend
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reported Content</CardTitle>
                <CardDescription>
                  Review and handle reported content and user complaints
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Reported By</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportedItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6">
                            No reported items
                          </TableCell>
                        </TableRow>
                      ) : (
                        reportedItems.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell className="capitalize">{report.type}</TableCell>
                            <TableCell>{report.item_title}</TableCell>
                            <TableCell>{report.reason}</TableCell>
                            <TableCell>{report.reporter_name}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  report.status === 'resolved'
                                    ? 'default'
                                    : report.status === 'investigating'
                                    ? 'secondary'
                                    : report.status === 'dismissed'
                                    ? 'outline'
                                    : 'destructive'
                                }
                              >
                                {report.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(report.created_at)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (report.type === 'listing') {
                                      navigate(`/listings/${report.item_id}`);
                                    } else if (report.type === 'user') {
                                      // Navigate to user profile in a real app
                                      toast({
                                        title: "View user profile",
                                        description: "This would navigate to the user profile in a real app",
                                      });
                                    } else {
                                      // Navigate to message in a real app
                                      toast({
                                        title: "View message",
                                        description: "This would navigate to the message in a real app",
                                      });
                                    }
                                  }}
                                >
                                  View
                                </Button>
                                {report.status === 'pending' && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleApproveItem(report.id, 'report')}
                                    >
                                      Take Action
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleRejectItem(report.id, 'report')}
                                    >
                                      Dismiss
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
