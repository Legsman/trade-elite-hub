import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { useSavedListings, useListingBids } from "@/hooks/listings";
import MainLayout from "@/components/layout/MainLayout";
import { Loading } from "@/components/ui/loading";
import { VerificationBanner } from "@/components/auth/VerificationBanner";
import { 
  AccountSidebar,
  QuickLinksCard,
  BuyingSection,
  SellingSection,
  ViewModeToggle,
  UserTierCard,
  UpgradePathCard
} from "@/components/dashboard";
import EnhancedVerificationModal from "@/components/auth/EnhancedVerificationModal";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { 
    savedListings, 
    isLoading: savedLoading, 
    error: savedError, 
    fetchSavedListings 
  } = useSavedListings();
  
  const [viewMode, setViewMode] = useState<"buying" | "selling">("buying");
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [verificationRequestType, setVerificationRequestType] = useState<'verified' | 'trader'>('verified');
  
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
          <button onClick={() => navigate("/login")} className="bg-primary text-primary-foreground px-4 py-2 rounded">Log In</button>
        </div>
      </MainLayout>
    );
  }

  // Handler for feedback (account sidebar) - no longer needed as it navigates to dedicated page

  const handleViewModeChange = (mode: "buying" | "selling") => {
    setViewMode(mode);
  };

  const handleUpgradeClick = (targetTier: 'verified' | 'trader') => {
    setVerificationRequestType(targetTier);
    setVerificationModalOpen(true);
  };

  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        <VerificationBanner />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left sidebar */}
          <div className="space-y-6">
            <UserTierCard />
            <UpgradePathCard onUpgradeClick={handleUpgradeClick} />
            <AccountSidebar 
              user={user}
              onFeedbackClick={() => {}} // No longer used, navigation handled in AccountSidebar
            />
            <QuickLinksCard />
          </div>

          {/* Main content */}
          <div className="md:col-span-2">
            <ViewModeToggle 
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
            />

            {viewMode === "buying" ? (
              <BuyingSection
                user={user}
                savedListings={savedListings}
                highestBids={highestBids}
                bidCounts={bidCounts}
              />
            ) : (
              <SellingSection userId={user.id} />
            )}
          </div>
        </div>

        <EnhancedVerificationModal
          isOpen={verificationModalOpen}
          onClose={() => setVerificationModalOpen(false)}
          requestType={verificationRequestType}
        />
      </div>
    </MainLayout>
  );
};

export default Dashboard;