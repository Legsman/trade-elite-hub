
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export const CreateListingAlert = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container py-12 text-center">
      <Alert className="max-w-md mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          You need to be logged in to create a listing.
        </AlertDescription>
      </Alert>
      <Button className="mt-6" onClick={() => navigate("/login")}>
        Log In
      </Button>
    </div>
  );
};
