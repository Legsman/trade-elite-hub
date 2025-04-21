
import { useState } from "react";
import { UserAdmin, ListingAdmin, ReportAdmin, AdminStats } from "../types";

export function useAdminStats(users: UserAdmin[], listings: ListingAdmin[], reports: ReportAdmin[]) {
  // This could contain analytics chart data as well
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: users.length,
    newUsersToday: users.filter(u => (u.created_at || "").slice(0, 10) === (new Date().toISOString().slice(0, 10))).length,
    activeListings: listings.filter(l => l.status === "active").length,
    pendingListings: listings.filter(l => l.status === "pending").length,
    totalMessages: 0,
    reportedContent: reports.length,
  });

  // Generate demo analytics data (replace later if you have real calculations)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const analyticsData = monthNames.slice(0, 6).map((name, i) => ({
    name,
    users: Math.floor(users.length * ((i + 1) / 6)),
    listings: Math.floor(listings.length * ((i + 1) / 6)),
    messages: Math.floor(200 * (i + 1)),
  }));

  return { stats, analyticsData, setStats };
}
