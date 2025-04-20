import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h1 className="text-9xl font-bold text-purple">404</h1>
        <h2 className="text-3xl font-semibold mt-4">Page Not Found</h2>
        <p className="text-muted-foreground mt-2 mb-6 text-center max-w-md">
          We couldn't find the page you're looking for. The page may have been moved or doesn't exist.
        </p>
        <Button asChild>
          <Link to="/">Return to Homepage</Link>
        </Button>
      </div>
    </MainLayout>
  );
};

export default NotFound;
