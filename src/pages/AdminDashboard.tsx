
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
      // In a real app, we would use admin role RLS policies to access this data
      // For now, we'll use mock data since we're building the UI
      
      // Mock users
      const mockUsers = [
        {
          id: "1",
          email: "james.smith@example.com",
          full_name: "James Smith",
          created_at: "2025-03-10T10:30:00Z",
          role: "user",
          strike_count: 0,
          status: "active",
          listings_count: 8,
          last_login: "2025-04-18T14:22:00Z"
        },
        {
          id: "2",
          email: "sarah.jones@example.com",
          full_name: "Sarah Jones",
          created_at: "2025-03-15T09:45:00Z",
          role: "user",
          strike_count: 1,
          status: "active",
          listings_count: 3,
          last_login: "2025-04-19T11:05:00Z"
        },
        {
          id: "3",
          email: "michael.brown@example.com",
          full_name: "Michael Brown",
          created_at: "2025-02-28T15:20:00Z",
          role: "user",
          strike_count: 2,
          status: "warning",
          listings_count: 12,
          last_login: "2025-04-17T16:48:00Z"
        },
        {
          id: "4",
          email: "emma.wilson@example.com",
          full_name: "Emma Wilson",
          created_at: "2025-04-05T11:10:00Z",
          role: "admin",
          strike_count: 0,
          status: "active",
          listings_count: 0,
          last_login: "2025-04-19T09:30:00Z"
        },
        {
          id: "5",
          email: "david.miller@example.com",
          full_name: "David Miller",
          created_at: "2025-01-20T08:15:00Z",
          role: "user",
          strike_count: 3,
          status: "suspended",
          listings_count: 5,
          last_login: "2025-04-10T14:20:00Z"
        }
      ];
      
      // Mock listings
      const mockListings = [
        {
          id: "1",
          title: "2020 Ferrari 488 Pista",
          seller_name: "James Smith",
          seller_id: "1",
          price: 350000,
          category: "cars",
          status: "active",
          created_at: "2025-03-20T09:30:00Z",
          views: 245,
          saves: 18
        },
        {
          id: "2",
          title: "Rolex Submariner Date",
          seller_name: "Sarah Jones",
          seller_id: "2",
          price: 14500,
          category: "watches",
          status: "active",
          created_at: "2025-04-02T14:15:00Z",
          views: 189,
          saves: 27
        },
        {
          id: "3",
          title: "Luxury Penthouse Apartment",
          seller_name: "Michael Brown",
          seller_id: "3",
          price: 2500000,
          category: "homes",
          status: "pending",
          created_at: "2025-04-18T10:45:00Z",
          views: 0,
          saves: 0
        },
        {
          id: "4",
          title: "Vintage Porsche 911 (1973)",
          seller_name: "Michael Brown",
          seller_id: "3",
          price: 120000,
          category: "cars",
          status: "active",
          created_at: "2025-03-28T08:20:00Z",
          views: 278,
          saves: 23
        },
        {
          id: "5",
          title: "Patek Philippe Nautilus 5711",
          seller_name: "David Miller",
          seller_id: "5",
          price: 135000,
          category: "watches",
          status: "suspended",
          created_at: "2025-02-15T11:30:00Z",
          views: 412,
          saves: 56
        }
      ];
      
      // Mock reported content
      const mockReported = [
        {
          id: "1",
          type: "listing",
          item_id: "5",
          item_title: "Patek Philippe Nautilus 5711",
          reporter_name: "Emma Wilson",
          reporter_id: "4",
          reason: "Counterfeit item",
          status: "pending",
          created_at: "2025-04-18T14:30:00Z"
        },
        {
          id: "2",
          type: "message",
          item_id: "msg123",
          item_title: "Message containing contact information",
          reporter_name: "James Smith",
          reporter_id: "1",
          reason: "Sharing contact information",
          status: "pending",
          created_at: "2025-04-19T09:15:00Z"
        },
        {
          id: "3",
          type: "user",
          item_id: "3",
          item_title: "User: Michael Brown",
          reporter_name: "Sarah Jones",
          reporter_id: "2",
          reason: "Harassment",
          status: "investigating",
          created_at: "2025-04-17T16:45:00Z"
        }
      ];
      
      // Mock analytics data
      const mockAnalyticsData = [
        { name: "Jan", users: 42, listings: 65, messages: 120 },
        { name: "Feb", users: 58, listings: 78, messages: 150 },
        { name: "Mar", users: 75, listings: 95, messages: 210 },
        { name: "Apr", users: 92, listings: 130, messages: 280 },
        { name: "May", users: 110, listings: 155, messages: 340 },
        { name: "Jun", users: 125, listings: 190, messages: 390 },
      ];
      
      // Mock statistics
      const mockStats = {
        totalUsers: 156,
        newUsersToday: 8,
        activeListings: 87,
        pendingListings: 12,
        totalMessages: 1358,
        reportedContent: 5,
      };
      
      setUsers(mockUsers);
      setListings(mockListings);
      setReportedItems(mockReported);
      setAnalyticsData(mockAnalyticsData);
      setStats(mockStats);
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
