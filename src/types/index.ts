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
