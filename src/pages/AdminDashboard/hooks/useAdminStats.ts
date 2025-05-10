
import { useState, useEffect } from "react";
import { UserAdmin, ListingAdmin, ReportAdmin, AdminStats, AnalyticsDataPoint } from "../types";
import { supabase } from "@/integrations/supabase/client";

export function useAdminStats(users: UserAdmin[], listings: ListingAdmin[], reports: ReportAdmin[]) {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: users.length,
    newUsersToday: users.filter(u => (u.created_at || "").slice(0, 10) === (new Date().toISOString().slice(0, 10))).length,
    activeListings: listings.filter(l => l.status === "active").length,
    pendingListings: listings.filter(l => l.status === "pending").length,
    totalMessages: 0,
    reportedContent: reports.length,
  });

  const [analyticsData, setAnalyticsData] = useState<AnalyticsDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch message count and analytics data
  useEffect(() => {
    async function fetchMessageStats() {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log("Fetching message count from database...");
        const { count, error: countError } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true });

        if (countError) {
          throw new Error(`Failed to fetch message count: ${countError.message}`);
        }

        // Update stats with real message count
        setStats(prev => ({
          ...prev,
          totalMessages: count || 0
        }));
        
        console.log(`Retrieved total message count: ${count}`);

        // Fetch analytics data for the past 6 months
        await fetchAnalyticsData();
      } catch (err) {
        console.error("Error fetching message stats:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    }

    fetchMessageStats();
  }, [users.length, listings.length, reports.length]);

  // Fetch real analytics data for the past 6 months
  async function fetchAnalyticsData() {
    const now = new Date();
    const data: AnalyticsDataPoint[] = [];
    
    try {
      console.log("Fetching analytics data for the past 6 months...");
      
      // Generate data for the last 6 months
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        const monthName = monthDate.toLocaleString('default', { month: 'short' });
        const monthStartStr = monthDate.toISOString();
        const monthEndStr = monthEnd.toISOString();
        
        console.log(`Fetching data for ${monthName} (${monthStartStr} - ${monthEndStr})`);

        // Count users created in this month
        const monthUsers = users.filter(user => {
          const userDate = user.created_at ? new Date(user.created_at) : null;
          return userDate && userDate >= monthDate && userDate <= monthEnd;
        }).length;

        // Count listings created in this month
        const monthListings = listings.filter(listing => {
          const listingDate = listing.created_at ? new Date(listing.created_at) : null;
          return listingDate && listingDate >= monthDate && listingDate <= monthEnd;
        }).length;

        // Count messages created in this month
        const { count: monthMessages, error: msgError } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', monthStartStr)
          .lt('created_at', monthEndStr);

        if (msgError) {
          console.error(`Error fetching message count for ${monthName}:`, msgError);
        }

        data.push({
          name: monthName,
          users: monthUsers,
          listings: monthListings,
          messages: monthMessages || 0
        });
        
        console.log(`${monthName} data:`, {
          users: monthUsers,
          listings: monthListings,
          messages: monthMessages || 0
        });
      }
      
      setAnalyticsData(data);
    } catch (err) {
      console.error("Error building analytics data:", err);
      setError(err instanceof Error ? err.message : String(err));
      
      // Provide fallback data in case of error
      const fallbackData = generateFallbackData();
      setAnalyticsData(fallbackData);
    }
  }

  // Generate fallback data if real data fetch fails
  function generateFallbackData(): AnalyticsDataPoint[] {
    console.warn("Using fallback analytics data due to fetch error");
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return monthNames.map((name, i) => ({
      name,
      users: Math.floor(users.length * ((i + 1) / 6)),
      listings: Math.floor(listings.length * ((i + 1) / 6)),
      messages: Math.floor(200 * (i + 1)),
    }));
  }

  return { stats, analyticsData, setStats, isLoading, error };
}
