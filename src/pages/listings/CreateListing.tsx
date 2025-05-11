
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/auth";
import { toast } from "@/hooks/use-toast";
import { Form } from "@/components/ui/form";
import { useCreateListing } from "@/hooks/listings";
import { ListingFormData } from "@/types";
import { CreateListingAlert } from "@/components/listings/CreateListingAlert";
import { CreateListingDetailsSection } from "@/components/listings/CreateListingDetailsSection";
import { CreateListingImagesSection } from "@/components/listings/CreateListingImagesSection";
import { CreateListingSubmit } from "@/components/listings/CreateListingSubmit";

// Define form schema
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
  }),
});

type FormValues = z.infer<typeof formSchema>;

const CreateListingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const { createListing, isSubmitting, error } = useCreateListing();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: undefined,
      condition: "",
      location: "",
      allowBestOffer: false,
      duration: "30",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a listing",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (images.length === 0) {
      toast({
        title: "Images required",
        description: "Please add at least one image to your listing",
        variant: "destructive",
      });
      return;
    }

    // Create a properly typed listing form data object
    const listingFormData: ListingFormData = {
      title: values.title,
      description: values.description,
      category: values.category,
      type: values.type,
      price: values.price,
      condition: values.condition,
      location: values.location,
      allowBestOffer: values.allowBestOffer,
      duration: values.duration,
      images: images,
      expiresAt: new Date(), // Will be calculated in the hook
      status: "active",
    };

    // Use the createListing hook to save the listing to the database
    const result = await createListing(listingFormData);

    if (result.success) {
      toast({
        title: "Listing created successfully",
        description: "Your listing has been published and is now live",
      });
      navigate(`/listings/${result.listingId}`);
    } else {
      toast({
        title: "Error creating listing",
        description: "There was a problem creating your listing. Please try again.",
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
          <h1 className="text-3xl font-bold tracking-tight mb-2">Create a New Listing</h1>
          <p className="text-muted-foreground mb-8">
            Fill in the details below to create your listing on our marketplace
          </p>

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
                hasImages={images.length > 0} 
              />
            </form>
          </Form>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreateListingPage;
