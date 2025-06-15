
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/auth";
import { Form } from "@/components/ui/form";
import { useEditListing } from "@/hooks/listings/useEditListing";
import { useListing } from "@/hooks/listings";
import { ListingFormData } from "@/types";
import { CreateListingAlert } from "@/components/listings/CreateListingAlert";
import { CreateListingDetailsSection } from "@/components/listings/CreateListingDetailsSection";
import { CreateListingImagesSection } from "@/components/listings/CreateListingImagesSection";
import { CreateListingSubmit } from "@/components/listings/CreateListingSubmit";
import { toast } from "@/hooks/use-toast";

// Schema reused from create
const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title cannot exceed 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000, "Description cannot exceed 2000 characters"),
  category: z.enum(["cars", "watches", "homes", "commercials", "collectables", "other"], {
    required_error: "Please select a category",
  }),
  type: z.enum(["auction", "classified"], {
    required_error: "Please select a listing type",
  }),
  price: z.number().positive("Price must be greater than 0"),
  condition: z.string().min(2, "Please specify the condition"),
  location: z.string().min(2, "Please specify the location"),
  allowBestOffer: z.boolean().default(false),
  duration: z.enum(["7", "14", "30", "60"], {
    required_error: "Please select a listing duration",
  }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CATEGORY_VALUES = ["cars", "watches", "homes", "commercials", "collectables", "other"] as const;
const TYPE_VALUES = ["auction", "classified"] as const;

const EditListingPage = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const { listing, isLoading: listingLoading } = useListing(id);
  const { updateListing, isSubmitting } = useEditListing(id);

  // File/image state handling
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  // Populate form with existing listing data
  useEffect(() => {
    if (listing) {
      // Correctly narrow category/type to union with runtime guard & assertion
      const safeCategory = CATEGORY_VALUES.includes(listing.category as any)
        ? (listing.category as (typeof CATEGORY_VALUES)[number])
        : "other";
      const safeType = TYPE_VALUES.includes(listing.type as any)
        ? (listing.type as (typeof TYPE_VALUES)[number])
        : "classified";
      form.reset({
        title: listing.title ?? "",
        description: listing.description ?? "",
        category: safeCategory,
        type: safeType,
        price: Number(listing.price ?? 0),
        condition: listing.condition ?? "",
        location: listing.location ?? "",
        allowBestOffer: typeof listing.allowBestOffer === "boolean"
          ? listing.allowBestOffer
          : !!listing.allowBestOffer,
        duration: "30", // fallback, not used in edit
      });
      setImageUrls(Array.isArray(listing.images) ? listing.images : []);
    }
    // eslint-disable-next-line
  }, [listing]);

  // Submission handler for updating listing
  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to edit a listing",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    if (images.length === 0 && imageUrls.length === 0) {
      toast({
        title: "Images required",
        description: "Please add at least one image to your listing",
        variant: "destructive",
      });
      return;
    }
    // Ensure all fields required for ListingFormData are present and correct type
    const listingFormData: ListingFormData = {
      title: values.title,
      description: values.description,
      category: values.category,
      type: values.type,
      price: values.price,
      condition: values.condition,
      location: values.location,
      images: images.length > 0 ? images : [],
      allowBestOffer: values.allowBestOffer,
      duration: values.duration, // Optional
    };
    const result = await updateListing(listingFormData, imageUrls);

    if (result.success) {
      toast({
        title: "Listing updated successfully",
        description: "Your changes are live.",
      });
      navigate(`/listings/${id}`);
    } else {
      toast({
        title: "Error updating listing",
        description: "There was a problem updating your listing. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <MainLayout>
        <CreateListingAlert />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Edit Listing</h1>
          <p className="text-muted-foreground mb-8">
            Edit your listing details and submit to update your item
          </p>
          {listingLoading ? (
            <div className="text-center py-8">Loading ...</div>
          ) : !listing ? (
            <div className="text-center py-8 text-destructive">Listing not found.</div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <CreateListingDetailsSection form={form} />

                <CreateListingImagesSection
                  images={images}
                  setImages={setImages}
                  imageUrls={imageUrls}
                  setImageUrls={setImageUrls}
                />

                <CreateListingSubmit
                  isSubmitting={isSubmitting}
                  hasImages={images.length > 0 || imageUrls.length > 0}
                  mode="edit"
                />
              </form>
            </Form>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default EditListingPage;
