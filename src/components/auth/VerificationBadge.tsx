import { Shield, ShieldCheck, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VerificationLevel } from "@/hooks/auth/useUserVerification";

interface VerificationBadgeProps {
  level: VerificationLevel;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function VerificationBadge({ level, size = "sm", showText = true }: VerificationBadgeProps) {
  const iconSize = size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-5 w-5";
  const textSize = size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base";

  switch (level) {
    case "unverified":
      return (
        <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30">
          <Shield className={`${iconSize} mr-1`} />
          {showText && <span className={textSize}>Unverified</span>}
        </Badge>
      );

    case "verified":
      return (
        <Badge variant="secondary" className="text-blue-700 bg-blue-100 border-blue-200 dark:text-blue-300 dark:bg-blue-950 dark:border-blue-800">
          <ShieldCheck className={`${iconSize} mr-1`} />
          {showText && <span className={textSize}>Verified</span>}
        </Badge>
      );

    case "trader":
      return (
        <Badge className="text-amber-800 bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-300 dark:text-amber-200 dark:from-amber-950 dark:to-yellow-950 dark:border-amber-700">
          <Crown className={`${iconSize} mr-1`} />
          {showText && <span className={textSize}>Trader</span>}
        </Badge>
      );

    default:
      return null;
  }
}