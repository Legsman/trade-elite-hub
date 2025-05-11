import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { useSavedListings, useListingBids } from "@/hooks/listings";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListingCard } from "@/components/listings/ListingCard";
import MainLayout from "@/components/layout/MainLayout";
import { Loading } from "@/components/ui/loading";
import { PlusCircle, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserBidsOffersTabs } from "@/components/listings/UserBidsOffersTabs";
import { supabase } from "@/integrations/supabase/client";
import { ListingSoldItemsTab } from "@/components/listings";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { 
    savedListings, 
    isLoading: savedLoading, 
    error: savedError, 
    fetchSavedListings 
  } = useSavedListings();
  
  const [activeTab, setActiveTab] = useState("saved");
  const [viewMode, setViewMode] = useState<"buying" | "selling">("buying");
  
  useEffect(() => {
    if (user) {
      fetchSavedListings();
    }
  }, [user, fetchSavedListings]);
  
  // Add this to get the highest bids for saved listings
  const { highestBids } = useListingBids(
    savedListings?.filter(listing => listing.type === "auction").map(listing => listing.id) || []
  );
  
  const isLoading = authLoading || savedLoading;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <Loading message="Loading dashboard..." />
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="container py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">Please log in to view your dashboard.</p>
          <Button onClick={() => navigate("/login")}>Log In</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Account</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">Name</h3>
                    <p className="text-muted-foreground">{user.name || "Not set"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Email</h3>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Feedback</h3>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="text-sm font-medium">5.0</span>
                      <span className="text-xs text-muted-foreground ml-1">(10 sales)</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate("/settings")}
                  >
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" size="sm" onClick={() => navigate("/listings/create")}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Create Listing
                </Button>
                <Button variant="ghost" className="w-full justify-start" size="sm" onClick={() => navigate("/listings")}>
                  Browse Listings
                </Button>
                <Button variant="ghost" className="w-full justify-start" size="sm" onClick={() => navigate("/messages")}>
                  Messages
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="md:col-span-2">
            {/* Buying/Selling Mode Toggle */}
            <div className="mb-6">
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "buying" | "selling")}>
                <TabsList className="w-full border-b rounded-none justify-start">
                  <TabsTrigger value="buying">Buying</TabsTrigger>
                  <TabsTrigger value="selling">Selling</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {viewMode === "buying" ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="w-full border-b rounded-none justify-start">
                  <TabsTrigger value="saved">Saved Listings</TabsTrigger>
                  <TabsTrigger value="bids">My Bids</TabsTrigger>
                  <TabsTrigger value="offers">My Offers</TabsTrigger>
                  <TabsTrigger value="purchases">Purchase History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="saved">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-semibold tracking-tight">
                        Your Saved Listings
                      </h2>
                      <Button variant="outline" size="sm" onClick={() => navigate("/listings")}>
                        Browse Listings
                      </Button>
                    </div>
                    
                    {savedListings.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <h3 className="text-lg font-medium mb-2">No saved listings yet</h3>
                        <p className="text-sm">Save listings to your dashboard to keep track of them.</p>
                        <Button variant="link" className="mt-4" onClick={() => navigate("/listings")}>
                          Browse Listings
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {savedListings.map((listing) => (
                          <ListingCard 
                            key={listing.id} 
                            listing={listing} 
                            highestBid={listing.type === "auction" ? highestBids[listing.id] || null : null}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="bids">
                  <UserBidsOffersTabs userId={user.id} initialTab="my-bids" />
                </TabsContent>
                
                <TabsContent value="offers">
                  <UserBidsOffersTabs userId={user.id} initialTab="my-offers" />
                </TabsContent>
                
                <TabsContent value="purchases">
                  <PurchaseHistoryTab userId={user.id} />
                </TabsContent>
              </Tabs>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="w-full border-b rounded-none justify-start">
                  <TabsTrigger value="listings">My Listings</TabsTrigger>
                  <TabsTrigger value="sold">Sold Items</TabsTrigger>
                  <TabsTrigger value="feedback">Feedback</TabsTrigger>
                </TabsList>
                
                <TabsContent value="listings">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-semibold tracking-tight">
                        Your Listings
                      </h2>
                      <Button variant="outline" size="sm" onClick={() => navigate("/listings/create")}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Listing
                      </Button>
                    </div>
                    
                    <UserListingsTab userId={user.id} />
                  </div>
                </TabsContent>
                
                <TabsContent value="sold">
                  <ListingSoldItemsTab userId={user.id} />
                </TabsContent>
                
                <TabsContent value="feedback">
                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">
                      Your Feedback
                    </h2>
                    <div className="flex items-center mb-4">
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="font-medium">5.0</span>
                      <span className="text-sm text-muted-foreground ml-1">(10 sales)</span>
                    </div>
                    
                    <div className="text-center py-8 text-muted-foreground">
                      <p>You haven't received any feedback yet.</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

// New component for purchase history
const PurchaseHistoryTab = ({ userId }: { userId: string }) => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchPurchases = async () => {
      setIsLoading(true);
      try {
        // Fetch listings won through accepted offers
        const { data: offerPurchases, error: offerError } = await supabase
          .from("offers")
          .select(`
            amount,
            updated_at,
            listings (
              id,
              title,
              price,
              images,
              category,
              type,
              location,
              condition,
              status,
              expires_at,
              created_at,
              views,
              saves,
              seller_id,
              description,
              allow_best_offer
            )
          `)
          .eq("user_id", userId)
          .eq("status", "accepted");
        
        if (offerError) throw offerError;
        
        // Fetch listings won through auctions
        const { data: auctionWins, error: auctionError } = await supabase
          .from("bids")
          .select(`
            amount,
            listings (
              id,
              title,
              price,
              images,
              category,
              type,
              location,
              condition,
              status,
              expires_at,
              created_at,
              views,
              saves,
              seller_id,
              description,
              allow_best_offer
            )
          `)
          .eq("user_id", userId)
          .eq("status", "won");
          
        if (auctionError) throw auctionError;
        
        // Transform the data into the Listing format with purchase details
        const purchasedListings = [
          ...offerPurchases.map(op => ({
            ...op.listings,
            purchaseType: 'offer',
            purchaseAmount: op.amount,
            purchaseDate: new Date(op.updated_at),
            expiresAt: new Date(op.listings.expires_at)
          })),
          ...auctionWins.map(win => ({
            ...win.listings,
            purchaseType: 'auction',
            purchaseAmount: win.amount,
            purchaseDate: new Date(win.listings.expires_at),
            expiresAt: new Date(win.listings.expires_at)
          }))
        ];
        
        // Sort by purchase date, newest first
        purchasedListings.sort((a, b) => b.purchaseDate.getTime() - a.purchaseDate.getTime());
        
        setPurchases(purchasedListings);
      } catch (error) {
        console.error("Error fetching purchase history:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPurchases();
  }, [userId]);
  
  if (isLoading) {
    return <Loading message="Loading purchase history..." />;
  }
  
  if (purchases.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <h3 className="text-lg font-medium mb-2">No purchase history yet</h3>
        <p className="text-sm">Items you buy will appear here.</p>
        <Button variant="link" onClick={() => navigate("/listings")}>
          Browse Listings
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight mb-4">
        Your Purchase History
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {purchases.map(purchase => (
          <Card key={purchase.id} className="overflow-hidden">
            <div className="flex flex-col sm:flex-row">
              <div className="w-full sm:w-1/4 md:w-1/5">
                <img 
                  src={purchase.images[0]} 
                  alt={purchase.title} 
                  className="w-full h-40 object-cover"
                />
              </div>
              <div className="p-4 flex-1">
                <h3 className="font-semibold text-lg mb-1">{purchase.title}</h3>
                <div className="text-sm text-muted-foreground mb-2">
                  {new Intl.DateTimeFormat('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  }).format(purchase.purchaseDate)}
                </div>
                <div className="mb-2">
                  <span className="font-medium">Purchase price:</span>{' '}
                  <span className="text-green-600 font-bold">
                    £{purchase.purchaseAmount.toLocaleString()}
                  </span>
                </div>
                <div className="text-sm mb-4">
                  <span className="bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-xs">
                    {purchase.purchaseType === 'offer' ? 'Offer Accepted' : 'Auction Won'}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/listings/${purchase.id}`)}
                >
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// New component for user listings
const UserListingsTab = ({ userId }: { userId: string }) => {
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

// New component for sold items
const SoldItemsTab = ({ userId }: { userId: string }) => {
  const navigate = useNavigate();
  const [soldItems, setSoldItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchSoldItems = async () => {
      setIsLoading(true);
      try {
        // Fetch listings with status "sold"
        const { data: soldListings, error: listingsError } = await supabase
          .from("listings")
          .select(`
            *,
            offers (
              amount, 
              user_id,
              status,
              updated_at
            )
          `)
          .eq("seller_id", userId)
          .eq("status", "sold")
          .order("updated_at", { ascending: false });
        
        if (listingsError) throw listingsError;
        
        // Fetch user profiles separately for the buyers
        const buyerIds = soldListings
          .map(item => {
            const acceptedOffer = item.offers.find(o => o.status === "accepted");
            return acceptedOffer ? acceptedOffer.user_id : null;
          })
          .filter(id => id !== null);
        
        // Only fetch profiles if there are buyer IDs
        let buyerProfiles = {};
        if (buyerIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .in("id", buyerIds);
            
          if (profilesError) throw profilesError;
          
          // Create a map of user_id to profile data
          buyerProfiles = profiles.reduce((acc, profile) => {
            acc[profile.id] = {
              name: profile.full_name || "Unknown User",
              avatar: profile.avatar_url
            };
            return acc;
          }, {});
        }
        
        // Transform to include buyer info and sale price
        const transformedItems = soldListings.map(item => {
          // Find accepted offer to get sale details
          const acceptedOffer = item.offers.find(o => o.status === "accepted");
          
          // Get buyer profile from our map if available
          const buyerProfile = acceptedOffer && buyerProfiles[acceptedOffer.user_id];
          
          return {
            ...item,
            expiresAt: new Date(item.expires_at),
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.updated_at),
            saleAmount: acceptedOffer ? acceptedOffer.amount : item.price,
            saleDate: acceptedOffer ? new Date(acceptedOffer.updated_at) : new Date(item.updated_at),
            buyer: acceptedOffer ? {
              id: acceptedOffer.user_id,
              name: buyerProfile?.name || "Unknown User",
              avatar: buyerProfile?.avatar
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
  }, [userId]);
  
  if (isLoading) {
    return <Loading message="Loading sold items..." />;
  }
  
  if (soldItems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <h3 className="text-lg font-medium mb-2">No sold items yet</h3>
        <p className="text-sm">Items you sell will appear here.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight mb-4">
        Your Sold Items
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {soldItems.map(item => (
          <Card key={item.id} className="overflow-hidden">
            <div className="flex flex-col sm:flex-row">
              <div className="w-full sm:w-1/4 md:w-1/5">
                <img 
                  src={item.images[0]} 
                  alt={item.title} 
                  className="w-full h-40 object-cover"
                />
              </div>
              <div className="p-4 flex-1">
                <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                <div className="text-sm text-muted-foreground mb-2">
                  {new Intl.DateTimeFormat('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  }).format(item.saleDate)}
                </div>
                <div className="mb-2">
                  <span className="font-medium">Sale price:</span>{' '}
                  <span className="text-green-600 font-bold">
                    £{item.saleAmount.toLocaleString()}
                  </span>
                </div>
                {item.buyer && (
                  <div className="mb-4 text-sm">
                    <span className="font-medium">Buyer:</span>{' '}
                    <span>{item.buyer.name}</span>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/listings/${item.id}`)}
                >
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
