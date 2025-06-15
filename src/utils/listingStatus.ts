
import { Listing } from "@/types";

// Return the "effective" status: e.g. 'expired' if listing has passed expiry, else use db status
export function getEffectiveListingStatus(listing: Listing): string {
  const { status, expiresAt } = listing;
  const expiresDate = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  const now = new Date();
  if (status === "active" && expiresDate < now) return "expired";
  return status;
}

// Checks if a listing is effectively active (db status active & not expired)
export function isListingActive(listing: Listing): boolean {
  return getEffectiveListingStatus(listing) === "active";
}

// Checks if a listing is "ended" (sold/expired/ended)
export function isListingEnded(listing: Listing): boolean {
  const eff = getEffectiveListingStatus(listing);
  return ["sold", "expired", "ended"].includes(eff);
}

// Checks if listing can be ended by user
export function canEndListing(listing: Listing): boolean {
  // Can end if active and not expired/sold/ended
  return isListingActive(listing);
}

// Used for badge coloring
export function getStatusBadgeVariant(listing: Listing): { color: string, text: string, pulse?: boolean } {
  const status = getEffectiveListingStatus(listing);
  const { expiresAt } = listing;
  const now = new Date();
  const expiresDate = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);

  if (status === "sold") return { color: "bg-green-600", text: "Sold" };
  if (status === "ended" || status === "expired") return { color: "bg-gray-500", text: "Ended" };
  if (status === "active" && (expiresDate.getTime() - now.getTime()) < 24 * 3600 * 1000 && expiresDate > now) return { color: "bg-red-500", text: "Ending Soon", pulse: true };
  if (status === "active") return { color: "bg-blue-500", text: "Active" };
  return { color: "bg-gray-400", text: status.charAt(0).toUpperCase() + status.slice(1) };
}

export function isListingExpired(listing: Listing): boolean {
  const { expiresAt, status } = listing;
  const expiresDate = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  return status === "active" && expiresDate < new Date();
}
