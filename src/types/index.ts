
export type ListingType = "auction" | "classified";
export type ListingCategory = "cars" | "watches" | "homes" | "commercials" | "collectables" | "other";

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
  images: string[]; // This stays as string[] for database stored listings
  allowBestOffer: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  views: number;
  saves: number;
  duration?: string; // For form purposes
}

// Adding a separate interface for the form data that includes File[] for images
export interface ListingFormData extends Omit<Listing, "id" | "sellerId" | "createdAt" | "updatedAt" | "views" | "saves" | "images"> {
  images: File[];
}
