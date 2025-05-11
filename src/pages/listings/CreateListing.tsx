
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertCircle } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/auth";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCreateListing } from "@/hooks/listings";
import { ListingFormData } from "@/types";
import { ListingDetailsForm } from "@/components/listings/ListingDetailsForm";
import { ImageUploader } from "@/components/listings/ImageUploader";

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
        <div className="container py-12 text-center">
          <Alert className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              You need to be logged in to create a listing.
            </AlertDescription>
          </Alert>
          <Button className="mt-6" onClick={() => navigate("/login")}>
            Log In
          </Button>
        </div>
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
              <Card>
                <CardHeader>
                  <CardTitle>Listing Details</CardTitle>
                  <CardDescription>
                    Provide accurate information to help buyers find your listing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ListingDetailsForm form={form} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Images</CardTitle>
                  <CardDescription>
                    Add up to 10 high-quality images of your item
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageUploader 
                    images={images}
                    setImages={setImages}
                    imageUrls={imageUrls}
                    setImageUrls={setImageUrls}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-between items-center">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Button 
                          type="submit" 
                          disabled={isSubmitting || images.length === 0}
                        >
                          {isSubmitting ? "Creating..." : "Create Listing"}
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {images.length === 0 && (
                      <TooltipContent>
                        <p>Please add at least one image to continue</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreateListingPage;
