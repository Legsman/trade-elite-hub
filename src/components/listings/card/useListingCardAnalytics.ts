
import { useEffect } from "react";
import { Listing } from "@/types";

export function useListingCardAnalytics(listing: Listing) {
  useEffect(() => {
    // Use Intersection Observer to only count view when card is actually visible, and only once
    let hasTracked = false;
    const card = document.getElementById(`listing-card-${listing.id}`);

    if (!card) return;

    const track = async () => {
      if (hasTracked) return;
      hasTracked = true;
      await fetch("/functions/v1/track-listing-view", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listingId: listing.id }),
      });
    };

    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            track();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(card);

    return () => observer.disconnect();
  }, [listing.id]);
}
