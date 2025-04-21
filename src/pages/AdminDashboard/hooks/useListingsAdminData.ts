
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ListingAdmin } from "../types";

export function useListingsAdminData(userIdToName: Record<string, string> = {}) {
  const [listings, setListings] = useState<ListingAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      const { data: listingsRaw, error } = await supabase
        .from("listings")
        .select("id, title, seller_id, price, category, status, created_at, views, saves");
      if (error) {
        setListings([]);
        setLoading(false);
        return;
      }
      setListings(
        (listingsRaw || []).map(listing => ({
          ...listing,
          seller_name: userIdToName[listing.seller_id] || "Unknown"
        }))
      );
      setLoading(false);
    }
    fetchListings();
  }, [userIdToName]);

  return { listings, loading, setListings };
}
