
export type UserRole = 'unverified' | 'verified' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  purchases: number;
  sales: number;
  feedbackRating: number;
  isVerified: boolean;
  isTwoFactorEnabled: boolean;
  annual2FAPaymentDate?: Date;
  referredBy?: string;
}

export type ListingType = 'auction' | 'classified';

export type ListingCategory = 'cars' | 'commercials' | 'watches' | 'homes' | 'collectables' | 'other';

export type ListingStatus = 'pending' | 'active' | 'sold' | 'expired';

export interface Listing {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  category: ListingCategory;
  type: ListingType;
  price: number;
  location: string;
  condition: string;
  images: string[];
  allowBestOffer: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  status: ListingStatus;
  views: number;
  saves: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  listingId?: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  hasContactInfo: boolean;
}

export interface Feedback {
  id: string;
  fromUserId: string;
  toUserId: string;
  listingId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}
