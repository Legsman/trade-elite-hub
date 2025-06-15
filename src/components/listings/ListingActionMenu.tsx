
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

interface ListingActionMenuProps {
  status: string;
  onRevise?: () => void;
  onEnd?: () => void;
  onRelist?: () => void;
  onViewStats?: () => void;
  onLeaveFeedback?: () => void;
  disableEnd?: boolean;
}

export function ListingActionMenu({
  status,
  onRevise,
  onEnd,
  onRelist,
  onViewStats,
  onLeaveFeedback,
  disableEnd = false,
}: ListingActionMenuProps) {
  // Status-driven action rendering
  // "Sold": View Stats, Leave Feedback
  // "Ended"/"Expired": Relist, View Stats
  // "Active": Revise, End Listing, View Stats

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8 p-0 absolute top-2 left-2 z-10 bg-background/90 shadow" tabIndex={0}>
          <MoreHorizontal className="w-5 h-5" />
          <span className="sr-only">Open listing actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={8} className="z-50 bg-background shadow-lg min-w-[170px]">
        {status === "active" && (
          <>
            <DropdownMenuItem onClick={onRevise}>Revise</DropdownMenuItem>
            <DropdownMenuItem onClick={onEnd} disabled={disableEnd}>End Listing</DropdownMenuItem>
            <DropdownMenuItem onClick={onViewStats}>View Stats</DropdownMenuItem>
          </>
        )}
        {(status === "ended" || status === "expired") && (
          <>
            <DropdownMenuItem onClick={onRelist}>Relist</DropdownMenuItem>
            <DropdownMenuItem onClick={onViewStats}>View Stats</DropdownMenuItem>
          </>
        )}
        {status === "sold" && (
          <>
            <DropdownMenuItem onClick={onViewStats}>View Stats</DropdownMenuItem>
            <DropdownMenuItem onClick={onLeaveFeedback}>Leave Feedback</DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
