import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSoldItems = (userId: string, triggerRefresh: any) => {
  const [soldItems, setSoldItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchSoldItems = async () => {
      setIsLoading(true);
      try {
        // Get listings with status 'sold' and this user as seller
        const { data: soldListings, error } = await supabase
          .from("listings")
          .select(`
            *,
            profiles: sale_buyer_id (
              id,
              full_name,
              avatar_url
            )
          `)
          .eq("seller_id", userId)
          .eq("status", "sold")
          .order("sale_date", { ascending: false });

        if (error) throw error;

        const transformedItems = soldListings.map(item => {
          return {
            ...item,
            expiresAt: new Date(item.expires_at),
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.updated_at),
            saleDate: item.sale_date ? new Date(item.sale_date) : null,
            saleAmount: item.sale_amount,
            buyer: item.profiles ? {
              id: item.profiles.id,
              name: item.profiles.full_name ?? "Unknown User",
              avatar: item.profiles.avatar_url
            } : null
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
