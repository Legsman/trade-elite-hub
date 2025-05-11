
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
                    <p className="text-muted-foreground">{user.user_metadata?.fullName || "Not set"}</p>
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="w-full border-b rounded-none justify-start">
                <TabsTrigger value="saved">Saved Listings</TabsTrigger>
                <TabsTrigger value="listings">My Listings</TabsTrigger>
                <TabsTrigger value="bids-offers">Bids & Offers</TabsTrigger>
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
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
                  
                  <div className="text-center py-8 text-muted-foreground">
                    <h3 className="text-lg font-medium mb-2">No listings yet</h3>
                    <p className="text-sm">Create a listing to sell your items.</p>
                    <Button variant="link" className="mt-4" onClick={() => navigate("/listings/create")}>
                      Create Listing
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="bids-offers">
                <UserBidsOffersTabs userId={user.id} />
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
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
