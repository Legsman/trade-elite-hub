import { useUserVerification, VerificationLevel } from "./useUserVerification";

export interface UserPermissions {
  canSendMessages: boolean;
  canPlaceBids: boolean;
  canMakeOffers: boolean;
  canCreateListings: boolean;
  canBuyAndSell: boolean;
  canAccessAdvancedFeatures: boolean;
  verificationLevel: VerificationLevel;
  loading: boolean;
}

export function usePermissions(): UserPermissions {
  const { level, loading } = useUserVerification();

  const getPermissions = (verificationLevel: VerificationLevel): UserPermissions => {
    switch (verificationLevel) {
      case "unverified":
        return {
          canSendMessages: false,
          canPlaceBids: false,
          canMakeOffers: false,
          canCreateListings: false,
          canBuyAndSell: false,
          canAccessAdvancedFeatures: false,
          verificationLevel,
          loading,
        };

      case "verified":
        return {
          canSendMessages: true,
          canPlaceBids: true,
          canMakeOffers: true,
          canCreateListings: true,
          canBuyAndSell: true,
          canAccessAdvancedFeatures: false,
          verificationLevel,
          loading,
        };

      case "trader":
        return {
          canSendMessages: true,
          canPlaceBids: true,
          canMakeOffers: true,
          canCreateListings: true,
          canBuyAndSell: true,
          canAccessAdvancedFeatures: true,
          verificationLevel,
          loading,
        };

      default:
        return {
          canSendMessages: false,
          canPlaceBids: false,
          canMakeOffers: false,
          canCreateListings: false,
          canBuyAndSell: false,
          canAccessAdvancedFeatures: false,
          verificationLevel: "unverified",
          loading,
        };
    }
  };

  return getPermissions(level);
}

// Helper hook for specific permission checks
export function usePermissionCheck() {
  const permissions = usePermissions();

  return {
    ...permissions,
    requiresVerification: (action: keyof Omit<UserPermissions, 'verificationLevel' | 'loading'>) => {
      return !permissions[action];
    },
    getVerificationMessage: (action: string) => {
      switch (permissions.verificationLevel) {
        case "unverified":
          return `You need to be verified to ${action}. Contact an admin to get verified.`;
        case "verified":
          return action.includes("advanced") 
            ? `This feature requires trader status. Contact an admin to upgrade your account.`
            : null;
        default:
          return null;
      }
    },
  };
}