import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const EmptyListingsState = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center py-8 text-muted-foreground">
      <h3 className="text-lg font-medium mb-2">No listings found</h3>
      <p className="text-sm">Create a listing to sell your items.</p>
      <Button
        variant="link"
        className="mt-4"
        onClick={() => navigate("/listings/create")}
      >
        Create Listing
      </Button>
    </div>
  );
};