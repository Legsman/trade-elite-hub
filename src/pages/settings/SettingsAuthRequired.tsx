
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const SettingsAuthRequired = () => {
  const navigate = useNavigate();

  return (
    <div className="container py-12">
      <Alert>
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          You need to be logged in to access your settings.
        </AlertDescription>
      </Alert>
      <Button className="mt-4" onClick={() => navigate("/login")}>
        Log In
      </Button>
    </div>
  );
};
export default SettingsAuthRequired;
