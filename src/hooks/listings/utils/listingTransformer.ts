
import { Listing } from "@/types";

export const transformListingData = (data: any[]): Listing[] => {
  return data.map(listing => ({
    id: listing.id,
    sellerId: listing.seller_id,
    title: listing.title,
    description: listing.description,
    category: listing.category,
    type: listing.type,
    price: Number(listing.price),
    location: listing.location,
    condition: listing.condition,
    images: listing.images,
    allowBestOffer: listing.allow_best_offer,
    expiresAt: new Date(listing.expires_at),
    createdAt: new Date(listing.created_at),
    updatedAt: new Date(listing.updated_at),
    status: listing.status,
    views: listing.views,
    saves: listing.saves,
  }));
};
