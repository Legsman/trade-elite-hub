
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Listing } from "@/types";

export const useListings = (options?: {
  category?: string;
  searchTerm?: string;
  listingType?: string;
  priceRange?: string;
  sortBy?: string;
}) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("listings")
        .select("*")
        .eq("status", "active");

      // Apply category filter
      if (options?.category) {
        query = query.eq("category", options.category);
      }

      // Apply search filter
      if (options?.searchTerm) {
        query = query.or(`title.ilike.%${options.searchTerm}%,description.ilike.%${options.searchTerm}%`);
      }

      // Apply listing type filter
      if (options?.listingType && options.listingType !== "all") {
        query = query.eq("type", options.listingType);
      }

      // Apply price range filter
      if (options?.priceRange && options.priceRange !== "any") {
        const [min, max] = options.priceRange.split("-").map(Number);
        if (max) {
          query = query.gte("price", min).lte("price", max);
        } else {
          query = query.gte("price", min);
        }
      }

      // Apply sorting
      if (options?.sortBy) {
        switch (options.sortBy) {
          case "newest":
            query = query.order("created_at", { ascending: false });
            break;
          case "price-low":
            query = query.order("price", { ascending: true });
            break;
          case "price-high":
            query = query.order("price", { ascending: false });
            break;
          case "popular":
            query = query.order("views", { ascending: false });
            break;
        }
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Convert database records to Listing type
      const mappedListings: Listing[] = data.map(item => ({
        id: item.id,
        sellerId: item.seller_id,
        title: item.title,
        description: item.description,
        category: item.category,
        type: item.type,
        price: Number(item.price),
        location: item.location,
        condition: item.condition,
        images: item.images,
        allowBestOffer: item.allow_best_offer,
        expiresAt: new Date(item.expires_at),
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        status: item.status,
        views: item.views,
        saves: item.saves,
      }));

      setListings(mappedListings);
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError("Failed to fetch listings. Please try again.");
      toast({
        title: "Error",
        description: "Failed to fetch listings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [options?.category, options?.searchTerm, options?.listingType, options?.priceRange, options?.sortBy]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return {
    listings,
    isLoading,
    error,
    refetch: fetchListings,
  };
};

export const useListing = (id?: string) => {
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchListing = useCallback(async () => {
    if (!id) {
      setListing(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      // Convert database record to Listing type
      const mappedListing: Listing = {
        id: data.id,
        sellerId: data.seller_id,
        title: data.title,
        description: data.description,
        category: data.category,
        type: data.type,
        price: Number(data.price),
        location: data.location,
        condition: data.condition,
        images: data.images,
        allowBestOffer: data.allow_best_offer,
        expiresAt: new Date(data.expires_at),
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        status: data.status,
        views: data.views,
        saves: data.saves,
      };

      setListing(mappedListing);

      // Increment view count
      if (data.seller_id !== user?.id) {
        await supabase
          .from("listings")
          .update({ views: data.views + 1 })
          .eq("id", id);
      }
    } catch (err) {
      console.error("Error fetching listing:", err);
      setError("Failed to fetch listing. Please try again.");
      toast({
        title: "Error",
        description: "Failed to fetch listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, user?.id]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  const toggleSaveListing = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save listings.",
        variant: "destructive",
      });
      return { success: false };
    }

    if (!listing) {
      return { success: false };
    }

    try {
      // Check if already saved
      const { data: savedData } = await supabase
        .from("saved_listings")
        .select("*")
        .eq("user_id", user.id)
        .eq("listing_id", listing.id)
        .maybeSingle();

      if (savedData) {
        // Remove from saved
        const { error } = await supabase
          .from("saved_listings")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", listing.id);

        if (error) throw error;

        // Update saves count
        await supabase
          .from("listings")
          .update({ saves: listing.saves - 1 })
          .eq("id", listing.id);

        toast({
          title: "Listing Removed",
          description: "Listing has been removed from your saved items.",
        });

        setListing(prev => prev ? { ...prev, saves: prev.saves - 1 } : null);
        return { success: true, saved: false };
      } else {
        // Add to saved
        const { error } = await supabase
          .from("saved_listings")
          .insert({
            user_id: user.id,
            listing_id: listing.id,
          });

        if (error) throw error;

        // Update saves count
        await supabase
          .from("listings")
          .update({ saves: listing.saves + 1 })
          .eq("id", listing.id);

        toast({
          title: "Listing Saved",
          description: "Listing has been added to your saved items.",
        });

        setListing(prev => prev ? { ...prev, saves: prev.saves + 1 } : null);
        return { success: true, saved: true };
      }
    } catch (err) {
      console.error("Error toggling save status:", err);
      toast({
        title: "Error",
        description: "Failed to update saved status. Please try again.",
        variant: "destructive",
      });
      return { success: false };
    }
  }, [listing, user]);

  const checkSavedStatus = useCallback(async () => {
    if (!user || !listing) {
      return false;
    }

    try {
      const { data, error } = await supabase
        .from("saved_listings")
        .select("*")
        .eq("user_id", user.id)
        .eq("listing_id", listing.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (err) {
      console.error("Error checking saved status:", err);
      return false;
    }
  }, [listing, user]);

  return {
    listing,
    isLoading,
    error,
    refetch: fetchListing,
    toggleSave: toggleSaveListing,
    checkSaved: checkSavedStatus,
  };
};

export const useCreateListing = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createListing = async (formData: Omit<Listing, "id" | "sellerId" | "createdAt" | "updatedAt" | "views" | "saves"> & { images: File[] }) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a listing.",
        variant: "destructive",
      });
      return { success: false, listingId: null };
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Upload images first
      const imageUrls: string[] = [];
      for (const imageFile of formData.images) {
        const fileName = `${user.id}/${Date.now()}-${imageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("listings")
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("listings")
          .getPublicUrl(fileName);

        imageUrls.push(publicUrlData.publicUrl);
      }

      // Calculate expires_at date based on duration
      const currentDate = new Date();
      const durationDays = parseInt(formData.duration || "30");
      const expiresAt = new Date(currentDate);
      expiresAt.setDate(currentDate.getDate() + durationDays);

      // Create the listing
      const { data, error } = await supabase.from("listings").insert({
        seller_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        price: formData.price,
        location: formData.location,
        condition: formData.condition,
        images: imageUrls,
        allow_best_offer: formData.allowBestOffer,
        expires_at: expiresAt.toISOString(),
        status: "active",
        views: 0,
        saves: 0,
      }).select("id").single();

      if (error) throw error;

      toast({
        title: "Listing Created",
        description: "Your listing has been created successfully.",
      });

      return { success: true, listingId: data.id };
    } catch (err) {
      console.error("Error creating listing:", err);
      setError("Failed to create listing. Please try again.");
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        variant: "destructive",
      });
      return { success: false, listingId: null };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createListing,
    isSubmitting,
    error,
  };
};

export const useSavedListings = () => {
  const { user } = useAuth();
  const [savedListings, setSavedListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedListings = useCallback(async () => {
    if (!user) {
      setSavedListings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("saved_listings")
        .select(`
          listing_id,
          listings:listing_id (*)
        `)
        .eq("user_id", user.id);

      if (error) throw error;

      // Map the joined data to Listing type
      const mappedListings: Listing[] = data
        .filter(item => item.listings) // Filter out any null listings
        .map(item => {
          const listing = item.listings as any;
          return {
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
          };
        });

      setSavedListings(mappedListings);
    } catch (err) {
      console.error("Error fetching saved listings:", err);
      setError("Failed to fetch saved listings. Please try again.");
      toast({
        title: "Error",
        description: "Failed to fetch saved listings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSavedListings();
  }, [fetchSavedListings]);

  return {
    savedListings,
    isLoading,
    error,
    refetch: fetchSavedListings,
  };
};
