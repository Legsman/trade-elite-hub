// Clipboard utility functions
export async function copyListingUrl(listingId: string): Promise<void> {
  try {
    const url = `${window.location.origin}/listings/${listingId}`;
    await navigator.clipboard.writeText(url);
    // Small feedback, but ideally would use a toast
    window.alert("Listing URL copied to clipboard!");
  } catch {
    window.alert("Failed to copy URL");
  }
}