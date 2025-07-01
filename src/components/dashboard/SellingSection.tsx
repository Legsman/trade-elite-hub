import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserListingsTab } from "@/components/dashboard";
import { PlusCircle } from "lucide-react";

interface SellingSectionProps {
  userId: string;
}

export const SellingSection = ({ userId }: SellingSectionProps) => {
  const navigate = useNavigate();

  return (
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
        <UserListingsTab userId={userId} />
      </div>
    </div>
  );
};