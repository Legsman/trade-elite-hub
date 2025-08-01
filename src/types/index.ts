export interface Profile {
  id: string;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  username?: string | null;
}

export interface Listing {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  category: string;
  type: string;
  price: number;
  location: string;
  condition: string;
  images: string[];
  allowBestOffer: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  views: number;
  saves: number;
  currentBid?: number | null;
  highestBidderId?: string | null;
  bidCount?: number; // Added missing bidCount property
  // Reserve price for auctions:
  reservePrice?: number | null;
  // Sale information for sold items:
  saleAmount?: number | null;
  saleBuyerId?: string | null;
  saleDate?: string | null;
  // Relist tracking fields:
  originalListingId?: string | null;
  relistCount?: number;
  relistReason?: string | null;
  relistedAt?: Date | null;
}

export interface Offer {
  id: string;
  userId: string;
  listingId: string;
  amount: number;
  message: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    fullName: string | null;
    avatarUrl: string | null;
    username: string | null;
  };
}

// Add maximum bid and bid increment to the Bid interface
export interface Bid {
  id: string;
  userId: string;
  listingId: string;
  amount: number;
  status: string;
  createdAt: Date;
  maximumBid: number;
  bidIncrement: number;
  // Correct user_profile interface for Bid, only full_name and avatar_url reflect actual data
  user_profile?: {
    full_name: string | null;
    avatar_url: string | null;
    username?: string | null;
  };
}

// Add User type definition
export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  createdAt: Date;
  purchases?: number;
  sales?: number;
  feedbackRating?: number;
  isVerified?: boolean;
  isTwoFactorEnabled?: boolean;
  annual2FAPaymentDate?: Date;
  referredBy?: string;
  emailConfirmedAt?: Date;
  lastSignInAt?: Date;
}

// Add UserProfile type definition
export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  username: string;
  avatarUrl?: string | null;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postcode?: string;
  country?: string;
  tradingAddress?: string;
  companyName?: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  subscriptionStatus?: string;
  subscriptionTier?: string;
  subscriptionEndDate?: Date;
  paymentMethods?: any;
  isTwoFactorEnabled?: boolean;
  strikeCount?: number;
}

// Update ListingFormData type definition to remove expiresAt and status properties
export interface ListingFormData {
  title: string;
  description: string;
  category: string;
  type: string;
  price: number;
  location: string;
  condition: string;
  images: File[];
  allowBestOffer: boolean;
  duration?: string;
}
