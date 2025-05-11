
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listings/ListingCard";

interface UserListingsTabProps {
  userId: string;
}

export const UserListingsTab = ({ userId }: UserListingsTabProps) => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("listings")
          .select("*")
          .eq("seller_id", userId)
          .eq("status", "active")
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        
        // Transform dates
        const transformedListings = data.map(listing => ({
          ...listing,
          expiresAt: new Date(listing.expires_at),
          createdAt: new Date(listing.created_at),
          updatedAt: new Date(listing.updated_at)
        }));
        
        setListings(transformedListings);
      } catch (error) {
        console.error("Error fetching user listings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchListings();
  }, [userId]);
  
  if (isLoading) {
    return <Loading message="Loading your listings..." />;
  }
  
  if (listings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <h3 className="text-lg font-medium mb-2">No active listings yet</h3>
        <p className="text-sm">Create a listing to sell your items.</p>
        <Button variant="link" className="mt-4" onClick={() => navigate("/listings/create")}>
          Create Listing
        </Button>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {listings.map((listing) => (
        <ListingCard 
          key={listing.id} 
          listing={listing} 
        />
      ))}
    </div>
  );
};

export default UserListingsTab;
