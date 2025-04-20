
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const NoConversations = ({ searchTerm, onClearSearch, onBrowseListings }: {
  searchTerm?: string;
  onClearSearch?: () => void;
  onBrowseListings?: () => void;
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
      {searchTerm ? (
        <>
          <h3 className="font-medium mb-1">No matching conversations</h3>
          <p className="text-muted-foreground text-sm">
            Try a different search term
          </p>
          <Button variant="ghost" className="mt-2" onClick={onClearSearch}>
            Clear Search
          </Button>
        </>
      ) : (
        <>
          <h3 className="font-medium mb-1">No conversations yet</h3>
          <p className="text-muted-foreground text-sm">
            When you contact sellers, your conversations will appear here
          </p>
          <Button className="mt-4" onClick={onBrowseListings}>
            Browse Listings
          </Button>
        </>
      )}
    </div>
  );
};

export default NoConversations;
