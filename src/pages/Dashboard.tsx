import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { useSavedListings, useListingBids } from "@/hooks/listings";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListingCard } from "@/components/listings/ListingCard";
import MainLayout from "@/components/layout/MainLayout";
import { Loading } from "@/components/ui/loading";
import { PlusCircle, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserBidsOffersTabs } from "@/components/listings/UserBidsOffersTabs";
import { SoldItemsTab as ImportedSoldItemsTab } from "@/components/listings";
import { PurchaseHistoryTab, UserListingsTab } from "@/components/dashboard";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { 
    savedListings, 
    isLoading: savedLoading, 
    error: savedError, 
    fetchSavedListings 
  } = useSavedListings();
  
  const [activeTab, setActiveTab] = useState("watch");
  const [viewMode, setViewMode] = useState<"buying" | "selling">("buying");
  
  useEffect(() => {
    if (user) {
      fetchSavedListings();
    }
  }, [user, fetchSavedListings]);
  
  const { highestBids, bidCounts } = useListingBids(
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

  // Define the new final set of tabs only for buying
  const buyingTabs = [
    { value: "watch", label: "Watch List" },
    { value: "bids", label: "My Bids" },
    { value: "offers", label: "My Offers" },
    { value: "purchases", label: "Purchase History" }
  ];

  // Handler for feedback (account sidebar)
  const handleFeedbackClick = () => {
    // Navigate to the selling view to show sold items where feedback can be given
    setViewMode("selling");
    setActiveTab("sold");
  };

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
                    <h3 className="text-sm font-medium mb-1">Feedback</h3>
                    <Button 
                      variant="ghost"
                      className="p-0 flex items-center gap-1 hover:bg-transparent text-yellow-500 hover:text-yellow-600"
                      onClick={handleFeedbackClick}
                    >
                      <Star className="h-4 w-4 fill-yellow-400 mr-1" />
                      <span className="text-sm font-medium">5.0</span>
                      <span className="text-xs text-muted-foreground ml-1">(10 sales)</span>
                      <span className="ml-2 underline text-primary text-xs">View Feedback</span>
                    </Button>
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
              <Tabs
                value={viewMode}
                onValueChange={(value) => {
                  setViewMode(value as "buying" | "selling");
                  setActiveTab(value === "buying" ? "watch" : "listings");
                }}
              >
                <TabsList className="w-full border-b rounded-none justify-start">
                  <TabsTrigger value="buying">Buying</TabsTrigger>
                  <TabsTrigger value="selling">Selling</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* BUYING SECTION */}
            {viewMode === "buying" ? (
              <div className="space-y-6">
                {/* Section Heading */}
                {activeTab === "watch" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-semibold tracking-tight">
                        Your Watch List
                      </h2>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/listings")}
                      >
                        Browse Listings
                      </Button>
                    </div>
                  </div>
                )}
                {activeTab === "bids" && (
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Your Bids
                  </h2>
                )}
                {activeTab === "offers" && (
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Your Offers
                  </h2>
                )}
                {activeTab === "purchases" && (
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Purchase History
                  </h2>
                )}

                {/* Move the child buttons below the section header above */}
                <div className="flex gap-2 mb-4">
                  {buyingTabs.map((tab) => (
                    <Button
                      key={tab.value}
                      variant={activeTab === tab.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveTab(tab.value)}
                    >
                      {tab.label}
                    </Button>
                  ))}
                </div>

                {/* Render content for each tab with NO extra child tabs inside component */}
                {activeTab === "watch" && (
                  <>
                    {savedListings.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <h3 className="text-lg font-medium mb-2">No items in your Watch List yet</h3>
                        <p className="text-sm">
                          Save listings to your Watch List to keep track of them.
                        </p>
                        <Button
                          variant="link"
                          className="mt-4"
                          onClick={() => navigate("/listings")}
                        >
                          Browse Listings
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {savedListings.map((listing) => (
                          <ListingCard
                            key={listing.id}
                            listing={listing}
                            highestBid={
                              listing.type === "auction"
                                ? highestBids[listing.id] || null
                                : null
                            }
                            bidCount={
                              listing.type === "auction"
                                ? bidCounts[listing.id] || 0
                                : 0
                            }
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}

                {activeTab === "bids" && (
                  // Show just bids. Don't show redundant inner tabs.
                  <UserBidsOffersTabs userId={user.id} initialTab="my-bids" showOnly="my-bids" />
                )}

                {activeTab === "offers" && (
                  // Show just offers. Don't show redundant inner tabs.
                  <UserBidsOffersTabs userId={user.id} initialTab="my-offers" showOnly="my-offers" />
                )}

                {activeTab === "purchases" && (
                  <PurchaseHistoryTab userId={user.id} />
                )}
              </div>
            ) : (
              // SELLING SECTION - show UserListingsTab directly
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold tracking-tight">
                      My Listings
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/listings/create")}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Listing
                    </Button>
                  </div>
                  <UserListingsTab userId={user.id} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
