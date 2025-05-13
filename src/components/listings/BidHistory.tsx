
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Loader2, User, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bid } from "@/types";
import { Separator } from "@/components/ui/separator";
import { obfuscateText } from "@/utils/stringUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BidHistoryProps {
  bids: Bid[];
  isLoading: boolean;
  onRefresh: () => void;
  currentUserId?: string;
}

export const BidHistory = ({ 
  bids, 
  isLoading,
  onRefresh,
  currentUserId
}: BidHistoryProps) => {
  const [showAll, setShowAll] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  // Enable debug mode in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const params = new URLSearchParams(window.location.search);
      setDebugMode(params.has('debug'));
    }
  }, []);

  // Format the date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  // Show only top 5 bids when not showing all
  const displayedBids = showAll ? bids : bids.slice(0, 5);
  const hasMoreBids = bids.length > 5;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl">Bid History</CardTitle>
          <CardDescription>
            {bids.length === 0 ? "No bids yet" : `${bids.length} bid${bids.length !== 1 ? 's' : ''} so far`}
          </CardDescription>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Refresh"
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : bids.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No bids have been placed yet.</p>
            <p className="text-sm mt-1">Be the first to place a bid!</p>
          </div>
        ) : (
          <>
            {debugMode && (
              <Alert className="mb-4 bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-xs text-amber-700">
                  Debug: Found {bids.length} bids. User profiles available: {bids.some(b => b.user?.fullName) ? 'Yes' : 'No'}
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-3">
              {displayedBids.map((bid, index) => (
                <div key={bid.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      {bid.user?.avatarUrl ? (
                        <img 
                          src={bid.user.avatarUrl} 
                          alt="User avatar" 
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium flex items-center">
                        {bid.userId === currentUserId 
                          ? "You" 
                          : obfuscateText(bid.user?.fullName || "Anonymous", 2)}
                        
                        {bid.userId === currentUserId && (
                          <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                        )}
                        {index === 0 && (
                          <Badge className="ml-2 text-xs bg-green-500">Highest</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(bid.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="font-medium">
                    £{bid.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
      {hasMoreBids && (
        <CardFooter className="pt-0">
          <Button 
            variant="ghost" 
            onClick={() => setShowAll(!showAll)} 
            className="w-full justify-center"
            size="sm"
          >
            {showAll ? (
              <>
                Show Less <ChevronUp className="ml-1 h-4 w-4" />
              </>
            ) : (
              <>
                Show All {bids.length} Bids <ChevronDown className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
