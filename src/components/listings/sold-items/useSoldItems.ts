
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSoldItems = (userId: string, triggerRefresh: any) => {
  const [soldItems, setSoldItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSoldItems = async () => {
      setIsLoading(true);
      try {
        // Get listings with status 'sold' for this user as seller
        const { data: soldListings, error } = await supabase
          .from("listings")
          .select("*")
          .eq("seller_id", userId)
          .eq("status", "sold")
          .order("sale_date", { ascending: false });

        if (error) throw error;
        if (!soldListings || soldListings.length === 0) {
          setSoldItems([]);
          setIsLoading(false);
          return;
        }

        // Collect all unique sale_buyer_ids to fetch their profiles
        const buyerIds = Array.from(
          new Set(
            soldListings
              .map((item) => item.sale_buyer_id)
              .filter((id) => !!id)
          )
        );

        let buyersById: Record<string, { id: string; name: string; avatar: string | null }> = {};

        if (buyerIds.length > 0) {
          const { data: buyerProfiles, error: profileError } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .in("id", buyerIds);

          if (profileError) {
            console.warn("Could not fetch buyer profiles", profileError);
          } else if (buyerProfiles) {
            buyersById = buyerProfiles.reduce((acc, p) => {
              acc[p.id] = {
                id: p.id,
                name: p.full_name ?? "Unknown User",
                avatar: p.avatar_url ?? null,
              };
              return acc;
            }, {});
          }
        }

        const transformedItems = soldListings.map((item) => {
          const buyer = item.sale_buyer_id ? buyersById[item.sale_buyer_id] ?? null : null;
          return {
            ...item,
            expiresAt: new Date(item.expires_at),
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.updated_at),
            saleDate: item.sale_date ? new Date(item.sale_date) : null,
            saleAmount: item.sale_amount,
            buyer,
          };
        });
        setSoldItems(transformedItems);
      } catch (error) {
        console.error("Error fetching sold items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSoldItems();
  }, [userId, triggerRefresh]);

  return { soldItems, isLoading };
};
