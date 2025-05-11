
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CreateListingSubmitProps {
  isSubmitting: boolean;
  hasImages: boolean;
}

export const CreateListingSubmit = ({ isSubmitting, hasImages }: CreateListingSubmitProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-between items-center">
      <Button 
        type="button" 
        variant="outline"
        onClick={() => navigate(-1)}
      >
        Cancel
      </Button>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button 
                type="submit" 
                disabled={isSubmitting || !hasImages}
              >
                {isSubmitting ? "Creating..." : "Create Listing"}
              </Button>
            </div>
          </TooltipTrigger>
          {!hasImages && (
            <TooltipContent>
              <p>Please add at least one image to continue</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
