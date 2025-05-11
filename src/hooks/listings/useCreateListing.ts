
import { useState } from "react";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ListingFormData } from "@/types";

export const useCreateListing = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createListing = async (formData: ListingFormData) => {
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
