
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
import OverviewTab from "./AdminDashboard/OverviewTab";
import UsersTab from "./AdminDashboard/UsersTab";
import ListingsTab from "./AdminDashboard/ListingsTab";
import ReportsTab from "./AdminDashboard/ReportsTab";

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
  const [reportedItems, setReportedItems] = useState<Supabase.Report[]>([]);
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
      let { data: usersRaw, error: usersError } = await supabase
        .from("profiles")
        .select("id, full_name, email, created_at, strike_count, is_two_factor_enabled, feedback_rating");

      if (usersError) throw usersError;
      let { data: rolesRaw, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");
      if (rolesError) throw rolesError;

      let { data: listingsRaw, error: listingsError } = await supabase
        .from("listings")
        .select("id, title, seller_id, price, category, status, created_at, views, saves");
      if (listingsError) throw listingsError;

      // Fetch reports using custom query to avoid TypeScript errors
      const { data: reportsRaw, error: reportsError } = await supabase
        .from('reports')
        .select('*');

      if (reportsError) throw reportsError;

      const userRolesMap = new Map();
      rolesRaw.forEach(({ user_id, role }) => {
        userRolesMap.set(user_id, role);
      });

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
          last_login: null,
        };
      });

      const userIdToName = {};
      for (const user of usersRaw) {
        userIdToName[user.id] = user.full_name;
      }

      const listingsData = (listingsRaw || []).map(listing => ({
        ...listing,
        seller_name: userIdToName[listing.seller_id] || "Unknown",
      }));

      // Process reports data - explicitly cast to ensure TypeScript recognizes the type
      const reports: Supabase.Report[] = (reportsRaw || []).map((report: any) => ({
        id: report.id,
        type: report.type,
        item_id: report.item_id,
        item_title: report.item_title || (report.type === "user" ? "User: " + userIdToName[report.item_id] : "Unknown"),
        reporter_name: report.reporter_name || "System",
        reporter_id: report.reporter_id,
        reason: report.reason,
        status: report.status,
        created_at: report.created_at,
      }));

      setReportedItems(reports);

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
      setAnalyticsData(analyticsData);

      const today = now.toISOString().slice(0, 10);
      setStats({
        totalUsers: usersData.length,
        newUsersToday: usersData.filter(u => (u.created_at || "").slice(0, 10) === today).length,
        activeListings: listingsData.filter(l => l.status === "active").length,
        pendingListings: listingsData.filter(l => l.status === "pending").length,
        totalMessages: 0,
        reportedContent: reports.length,
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
    setUsers(prev => 
      prev.map(user => user.id === id ? { ...user, status: 'suspended' } : user)
    );
    
    toast({
      title: "User suspended",
      description: "The user has been suspended",
    });
  };

  const handleUnsuspendUser = (id) => {
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
