
import { useState } from "react";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ListingFormData } from "@/types";

export const useEditListing = (listingId?: string) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Accepts uploaded files and current image URLs
  const updateListing = async (formData: ListingFormData, currentImageUrls: string[]) => {
    if (!user || !listingId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to update a listing.",
        variant: "destructive",
      });
      return { success: false, listingId: null };
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Upload new images and combine with existing URLs
      let newImageUrls: string[] = [...currentImageUrls];
      if (formData.images && formData.images.length > 0) {
        for (const imageFile of formData.images) {
          const fileName = `${user.id}/${Date.now()}-${imageFile.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("listings")
            .upload(fileName, imageFile);

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from("listings")
            .getPublicUrl(fileName);

          newImageUrls.push(publicUrlData.publicUrl);
        }
      }

      // Expires at update logic: do NOT change duration on edit
      // Instead, preserve the current expires_at in DB, or allow extending in future

      // Update the listing
      const { error } = await supabase.from("listings").update({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        price: formData.price,
        location: formData.location,
        condition: formData.condition,
        images: newImageUrls,
        allow_best_offer: formData.allowBestOffer,
        updated_at: new Date().toISOString(),
      })
        .eq("id", listingId);

      if (error) throw error;

      toast({
        title: "Listing Updated",
        description: "Your listing has been updated.",
      });

      return { success: true, listingId };
    } catch (err) {
      console.error("Error updating listing:", err);
      setError("Failed to update listing. Please try again.");
      toast({
        title: "Error",
        description: "Failed to update listing. Please try again.",
        variant: "destructive",
      });
      return { success: false, listingId: null };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    updateListing,
    isSubmitting,
    error,
  };
};
