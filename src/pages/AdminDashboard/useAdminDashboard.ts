import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { assignOrRemoveAdminRole } from "@/utils/adminUtils";

export function useAdminDashboard() {
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
  const [users, setUsers] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [reportedItems, setReportedItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [listingFilter, setListingFilter] = useState("all");
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    
    try {
      console.log("Starting admin data fetch");
      
      // Get current user session
      const sessionResponse = await supabase.auth.getSession();
      console.log("Session response:", sessionResponse);
      
      if (!sessionResponse.data.session) {
        throw new Error("No active session found. Please log in again.");
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        throw new Error("User not authenticated");
      }
      
      console.log("Fetching data for user:", user.id);
      setCurrentUserId(user.id);
      
      // IMPORTANT: Always set this user as admin for development
      // In production, you would use proper role checks
      
      // First, let's try to get profiles to show something
      console.log("Fetching profiles data");
      let { data: usersRaw, error: usersError } = await supabase
        .from("profiles")
        .select("id, full_name, email, created_at, strike_count, is_two_factor_enabled, feedback_rating");
      
      if (usersError) {
        console.error('Error fetching profiles:', usersError);
        throw new Error(`Failed to fetch profiles: ${usersError.message}`);
      }

      if (!usersRaw || usersRaw.length === 0) {
        console.warn("No profiles found in the database");
        usersRaw = []; // Set to empty array to avoid null reference errors
      }

      // We'll use a direct query to get user roles instead of the RPC function
      // This avoids potential recursive RLS issues
      let rolesRaw: any[] = [];
      try {
        console.log("Fetching user roles directly");
        const { data, error } = await supabase
          .from("user_roles")
          .select("user_id, role");
        
        if (error) {
          console.error('Error fetching roles directly:', error);
          // Continue with empty roles rather than failing
        } else {
          rolesRaw = data || [];
        }
      } catch (roleError) {
        console.error('Exception fetching roles:', roleError);
        // Continue with empty roles
      }

      console.log("Fetching listings data");
      let { data: listingsRaw, error: listingsError } = await supabase
        .from("listings")
        .select("id, title, seller_id, price, category, status, created_at, views, saves");
      
      if (listingsError) {
        console.error('Error fetching listings:', listingsError);
        throw new Error(`Failed to fetch listings: ${listingsError.message}`);
      }

      if (!listingsRaw) {
        console.warn("No listings found in database");
        listingsRaw = []; // Set to empty array to avoid null reference errors
      }

      console.log("Processing fetched data", {
        profilesCount: usersRaw?.length || 0,
        rolesCount: rolesRaw?.length || 0,
        listingsCount: listingsRaw?.length || 0
      });
      
      const userRolesMap = new Map();
      if (rolesRaw?.length) {
        rolesRaw.forEach(({ user_id, role }) => {
          userRolesMap.set(user_id, role);
        });
      }

      // Force current user to be admin for development
      userRolesMap.set(user.id, 'admin');

      const usersData = usersRaw.map(profile => {
        const listings_count = listingsRaw.filter(l => l.seller_id === profile.id).length;
        return {
          id: profile.id,
          email: profile.email || 'No Email',
          full_name: profile.full_name || 'Unknown User',
          created_at: profile.created_at,
          role: userRolesMap.get(profile.id) || "user",
          strike_count: profile.strike_count || 0,
          status: profile.strike_count >= 3 ? "suspended" : profile.strike_count === 2 ? "warning" : "active",
          listings_count,
          last_login: null,
        };
      });

      const userIdToName: Record<string, string> = {};
      for (const user of usersRaw) {
        userIdToName[user.id] = user.full_name || 'Unknown User';
      }

      const listingsData = listingsRaw.map(listing => ({
        ...listing,
        seller_name: userIdToName[listing.seller_id] || "Unknown",
      }));

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

      console.log("Generating analytics data");
      const now = new Date();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const analyticsData = monthNames.slice(0, 6).map((name, i) => ({
        name,
        users: Math.floor(Math.max(usersData.length, 10) * ((i + 1) / 6)),
        listings: Math.floor(Math.max(listingsData.length, 20) * ((i + 1) / 6)),
        messages: Math.floor(200 * (i + 1)),
      }));

      console.log("Setting state with processed data");
      setUsers(usersData);
      setListings(listingsData);
      setReportedItems(reported);
      setAnalyticsData(analyticsData);

      const today = now.toISOString().slice(0, 10);
      setStats({
        totalUsers: usersData.length,
        newUsersToday: usersData.filter(u => u.created_at && u.created_at.slice(0, 10) === today).length,
        activeListings: listingsData.filter(l => l.status === "active").length,
        pendingListings: listingsData.filter(l => l.status === "pending").length,
        totalMessages: 0,
        reportedContent: reported.length,
      });
      
      console.log("Admin data fetch completed successfully");
    } catch (error: any) {
      console.error('Error fetching admin data:', error);
      const errorMessage = error?.message || "Unknown error occurred";
      setFetchError(errorMessage);
      
      // Generate some mock data for development if we're having issues
      // This helps avoid UI errors when data is missing
      const mockUsers = Array(5).fill(0).map((_, i) => ({
        id: `mock-${i}`,
        email: `user${i}@example.com`,
        full_name: `Mock User ${i}`,
        created_at: new Date().toISOString(),
        role: i === 0 ? "admin" : "user",
        strike_count: 0,
        status: "active",
        listings_count: Math.floor(Math.random() * 5),
        last_login: null,
      }));
      
      setUsers(mockUsers);
      
      toast({
        title: "Error loading admin data",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Expose a refetch function that can be called from the UI
  const refetchData = useCallback(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  useEffect(() => {
    console.log("Admin dashboard mounted, fetching data");
    fetchAdminData();
  }, [fetchAdminData]);

  const promoteAdmin = useCallback(async (userId: string) => {
    const { success, error } = await assignOrRemoveAdminRole(userId, "admin", "add");
    if (success) {
      setUsers(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, role: "admin" } : u
        )
      );
      toast({ title: "Admin promoted", description: "User has been made an admin" });
    } else {
      toast({ title: "Failed to promote", description: error?.message || error || "Failed", variant: "destructive" });
    }
  }, []);

  const demoteAdmin = useCallback(async (userId: string) => {
    const { success, error } = await assignOrRemoveAdminRole(userId, "admin", "remove");
    if (success) {
      setUsers(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, role: "user" } : u
        )
      );
      toast({ title: "Admin removed", description: "User has been demoted from admin" });
    } else {
      toast({ title: "Failed to demote", description: error?.message || error || "Failed", variant: "destructive" });
    }
  }, []);

  const handleApproveItem = useCallback((id: string, type: string) => {
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
  }, []);

  const handleRejectItem = useCallback((id: string, type: string) => {
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
  }, []);

  const handleSuspendUser = useCallback((id: string) => {
    setUsers(prev =>
      prev.map(user => user.id === id ? { ...user, status: 'suspended' } : user)
    );
    toast({
      title: "User suspended",
      description: "The user has been suspended",
    });
  }, []);

  const handleUnsuspendUser = useCallback((id: string) => {
    setUsers(prev =>
      prev.map(user => user.id === id ? { ...user, status: 'active', strike_count: 0 } : user)
    );
    toast({
      title: "User unsuspended",
      description: "The user has been unsuspended and can now use the platform again",
    });
  }, []);

  const filteredUsers = useMemo(() => users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    if (userFilter === 'all') return matchesSearch;
    if (userFilter === 'admin') return matchesSearch && user.role === 'admin';
    if (userFilter === 'active') return matchesSearch && user.status === 'active';
    if (userFilter === 'warning') return matchesSearch && user.status === 'warning';
    if (userFilter === 'suspended') return matchesSearch && user.status === 'suspended';
    return matchesSearch;
  }), [users, searchQuery, userFilter]);

  const filteredListings = useMemo(() => listings.filter(listing => {
    const matchesSearch = listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.seller_name?.toLowerCase().includes(searchQuery.toLowerCase());
    if (listingFilter === 'all') return matchesSearch;
    if (listingFilter === 'active') return matchesSearch && listing.status === 'active';
    if (listingFilter === 'pending') return matchesSearch && listing.status === 'pending';
    if (listingFilter === 'suspended') return matchesSearch && listing.status === 'suspended';
    return matchesSearch;
  }), [listings, searchQuery, listingFilter]);

  return {
    loading,
    fetchError,
    stats,
    analyticsData,
    listings,
    reportedItems,
    users,
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
    currentUserId,
    refetchData,
  };
}
