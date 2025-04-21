
export interface UserAdmin {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  role: string;
  strike_count: number;
  status: "active" | "warning" | "suspended";
  listings_count: number;
  last_login: string | null;
}

export interface ListingAdmin {
  id: string;
  title: string;
  seller_id: string;
  price: number;
  category: string;
  status: string;
  created_at: string;
  views: number;
  saves: number;
  seller_name: string;
}

export interface ReportAdmin {
  id: string;
  type: string;
  item_id: string;
  item_title: string;
  reporter_name: string;
  reporter_id?: string;
  reason: string;
  status: string;
  created_at: string;
}

export interface AdminStats {
  totalUsers: number;
  newUsersToday: number;
  activeListings: number;
  pendingListings: number;
  totalMessages: number;
  reportedContent: number;
}
