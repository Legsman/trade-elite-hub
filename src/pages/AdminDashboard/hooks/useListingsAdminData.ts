
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ListingAdmin } from "../types";

export function useListingsAdminData(userIdToName: Record<string, string> = {}) {
  const [listings, setListings] = useState<ListingAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | string | null>(null);

  useEffect(() => {
    async function fetchListings() {
      try {
        setLoading(true);
        setError(null);
        
        const { data: listingsRaw, error: listingsError } = await supabase
          .from("listings")
          .select("id, title, seller_id, price, category, status, created_at, views, saves");
          
        if (listingsError) {
          console.error("Error fetching listings:", listingsError);
          setError(listingsError.message);
          setListings([]);
          return;
        }
        
        setListings(
          (listingsRaw || []).map(listing => ({
            ...listing,
            seller_name: userIdToName[listing.seller_id] || "Unknown"
          }))
        );
      } catch (err) {
        console.error("Unexpected error fetching listings:", err);
        setError(err instanceof Error ? err.message : String(err));
        setListings([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchListings();
  }, [userIdToName]);

  return { listings, loading, setListings, error };
}
