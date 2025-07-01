import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listings/ListingCard";
import { UserBidsOffersTabs } from "@/components/listings/UserBidsOffersTabs";
import { PurchaseHistoryTab } from "@/components/dashboard";

interface BuyingSectionProps {
  user: any;
  savedListings: any[];
  highestBids: Record<string, any>;
  bidCounts: Record<string, number>;
}

export const BuyingSection = ({ user, savedListings, highestBids, bidCounts }: BuyingSectionProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("watch");

  // Define the buying tabs
  const buyingTabs = [
    { value: "watch", label: "Watch List" },
    { value: "bids", label: "My Bids" },
    { value: "offers", label: "My Offers" },
    { value: "purchases", label: "Purchase History" }
  ];

  const getSectionTitle = () => {
    switch (activeTab) {
      case "watch": return "Your Watch List";
      case "bids": return "Your Bids";
      case "offers": return "Your Offers";
      case "purchases": return "Purchase History";
      default: return "Your Watch List";
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Heading */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            {getSectionTitle()}
          </h2>
          {activeTab === "watch" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/listings")}
            >
              Browse Listings
            </Button>
          )}
        </div>
      </div>

      {/* Tab Buttons */}
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

      {/* Tab Content */}
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
        <UserBidsOffersTabs userId={user.id} initialTab="my-bids" showOnly="my-bids" />
      )}

      {activeTab === "offers" && (
        <UserBidsOffersTabs userId={user.id} initialTab="my-offers" showOnly="my-offers" />
      )}

      {activeTab === "purchases" && (
        <PurchaseHistoryTab userId={user.id} />
      )}
    </div>
  );
};