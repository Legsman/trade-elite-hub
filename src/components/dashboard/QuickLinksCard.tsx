import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Search, MessageSquare } from "lucide-react";

export const QuickLinksCard = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Links</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="ghost" className="w-full justify-start" size="sm" onClick={() => navigate("/listings/create")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Listing
        </Button>
        <Button variant="ghost" className="w-full justify-start" size="sm" onClick={() => navigate("/listings")}>
          <Search className="mr-2 h-4 w-4" /> Browse Listings
        </Button>
        <Button variant="ghost" className="w-full justify-start" size="sm" onClick={() => navigate("/messages")}>
          <MessageSquare className="mr-2 h-4 w-4" /> Messages
        </Button>
      </CardContent>
    </Card>
  );
};