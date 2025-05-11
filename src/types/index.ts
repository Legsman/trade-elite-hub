
export interface Profile {
  id: string;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
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
  };
}

// Add maximum bid and bid increment to the Bid interface
export interface Bid {
  id: string;
  userId: string;
  listingId: string;
  amount: number;
  maximumBid: number;
  bidIncrement: number;
  createdAt: Date;
  status: string;
  user?: {
    fullName: string | null;
    avatarUrl: string | null;
  };
}

// Add User type definition
export interface User {
  id: string;
  name: string;
  email: string;
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

// Add ListingFormData type definition
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
