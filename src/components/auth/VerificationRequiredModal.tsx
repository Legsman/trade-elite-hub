import { Shield, MessageCircle, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VerificationLevel } from "@/hooks/auth/useUserVerification";

interface VerificationRequiredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: string;
  currentLevel: VerificationLevel;
  requiredLevel: VerificationLevel;
}

export function VerificationRequiredModal({
  open,
  onOpenChange,
  action,
  currentLevel,
  requiredLevel,
}: VerificationRequiredModalProps) {
  const getTitle = () => {
    if (currentLevel === "unverified") {
      return "Verification Required";
    }
    return "Higher Verification Level Required";
  };

  const getDescription = () => {
    if (currentLevel === "unverified") {
      return `You need to be verified to ${action}. Verified users can send messages, place bids, make offers, and create listings.`;
    }
    return `This feature requires ${requiredLevel} status. Traders have access to advanced features and higher limits.`;
  };

  const getActionText = () => {
    if (currentLevel === "unverified") {
      return "Get Verified";
    }
    return "Upgrade to Trader";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {getTitle()}
          </DialogTitle>
          <DialogDescription className="text-left">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <Button className="w-full">
            <Shield className="h-4 w-4 mr-2" />
            {getActionText()}
          </Button>
          
          <Button variant="outline" className="w-full">
            <MessageCircle className="h-4 w-4 mr-2" />
            Contact Admin
          </Button>

          <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full">
            Cancel
          </Button>
        </div>

        <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted rounded-lg">
          <p className="font-medium mb-1">Verification Levels:</p>
          <ul className="space-y-1">
            <li>• <strong>Unverified:</strong> Browse only</li>
            <li>• <strong>Verified:</strong> Buy, sell, message, bid</li>
            <li>• <strong>Trader:</strong> Advanced features & higher limits</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}