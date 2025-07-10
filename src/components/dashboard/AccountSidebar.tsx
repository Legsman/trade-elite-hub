import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useFeedback } from "@/hooks/feedback";

interface AccountSidebarProps {
  user: any;
  onFeedbackClick: () => void;
}

export const AccountSidebar = ({ user, onFeedbackClick }: AccountSidebarProps) => {
  const navigate = useNavigate();
  
  // Fetch user's feedback as seller to show real ratings
  const { data: userFeedback, isLoading: feedbackLoading } = useFeedback({
    userId: user?.id,
    as: "seller",
    listingId: null
  });
  
  // Calculate feedback statistics
  const feedbackStats = userFeedback ? {
    averageRating: userFeedback.length > 0 
      ? (userFeedback.reduce((sum, fb) => sum + fb.rating, 0) / userFeedback.length).toFixed(1)
      : null,
    count: userFeedback.length
  } : { averageRating: null, count: 0 };

  return (
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
            {feedbackLoading ? (
              <div className="text-sm text-muted-foreground">Loading feedback...</div>
            ) : (
              <Button 
                variant="ghost"
                className="p-0 flex items-center gap-1 hover:bg-transparent text-yellow-500 hover:text-yellow-600"
                onClick={() => navigate("/feedback")}
              >
                <Star className="h-4 w-4 fill-yellow-400 mr-1" />
                <span className="text-sm font-medium">
                  {feedbackStats.averageRating || "No rating"}
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  ({feedbackStats.count} feedback)
                </span>
                <span className="ml-2 underline text-primary text-xs">View Feedback</span>
              </Button>
            )}
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
  );
};