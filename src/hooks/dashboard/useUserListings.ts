import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type TabType = "active" | "ended" | "sold" | "all";

export const useUserListings = (userId: string, tab: TabType, isEnding: boolean) => {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchListings = async () => {
    if (tab === "sold") return; // Don't fetch here, handled in useSoldItems
    
    setIsLoading(true);
    try {
      let query = supabase
        .from("listings")
        .select("*")
        .eq("seller_id", userId)
        .order("created_at", { ascending: false });

      // Tab filtering (fully correct now that we have explicit sale status and info)
      if (tab === "active") {
        // Show only active non-ended/sold
        query = query.eq("status", "active");
      }
      if (tab === "ended") {
        // Ended/expired and not sold
        query = query.in("status", ["ended", "expired", "relisted"]).or(`(status.eq.active,and(expires_at.lt.${new Date().toISOString()},sale_buyer_id.is.null))`);
      }
      if (tab === ("sold" as TabType)) {
        query = query.eq("status", "sold");
      }
      // "all" shows all

      const { data, error } = await query;

      if (error) throw error;

      // Convert date strings to Date and add new sale fields
      const transformedListings = data.map((listing) => ({
        ...listing,
        expiresAt: new Date(listing.expires_at),
        createdAt: new Date(listing.created_at),
        updatedAt: new Date(listing.updated_at),
        saleDate: listing.sale_date ? new Date(listing.sale_date) : undefined,
        saleAmount: listing.sale_amount ?? undefined,
        saleBuyerId: listing.sale_buyer_id ?? undefined,
        originalListingId: (listing as any).original_listing_id ?? undefined,
        relistCount: (listing as any).relist_count ?? 0,
        relistReason: (listing as any).relist_reason ?? undefined,
        relistedAt: (listing as any).relisted_at ? new Date((listing as any).relisted_at) : undefined,
      }));

      setListings(transformedListings);
    } catch (error) {
      console.error("Error fetching user listings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [userId, tab, isEnding]);

  return { listings, isLoading, refetch: fetchListings };
};