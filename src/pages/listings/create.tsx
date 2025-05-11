
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ImagePlus, Trash2, AlertCircle } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCreateListing } from "@/hooks/use-listing";
import { ListingFormData } from "@/types"; // Import the new interface

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
      ...values,
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    if (images.length + newFiles.length > 10) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 10 images per listing",
        variant: "destructive",
      });
      return;
    }

    // Create URLs for preview
    const newUrls = newFiles.map(file => URL.createObjectURL(file));
    
    setImages(prev => [...prev, ...newFiles]);
    setImageUrls(prev => [...prev, ...newUrls]);
  };

  const removeImage = (index: number) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(imageUrls[index]);
    
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
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
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 2020 Ferrari 488 Pista" {...field} />
                        </FormControl>
                        <FormDescription>
                          Clearly describe what you're selling in a few words
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cars">Cars</SelectItem>
                              <SelectItem value="watches">Watches</SelectItem>
                              <SelectItem value="homes">Homes</SelectItem>
                              <SelectItem value="commercials">Commercials</SelectItem>
                              <SelectItem value="collectables">Collectables</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Listing Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select listing type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="classified">Fixed Price (Classified)</SelectItem>
                              <SelectItem value="auction">Auction</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            How you want to sell your item
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide a detailed description of your item..."
                            className="min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Include condition, features, history, and any other relevant details
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (£)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={event => field.onChange(parseFloat(event.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="allowBestOffer"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Accept Best Offers
                            </FormLabel>
                            <FormDescription>
                              Allow buyers to make offers below your asking price
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condition</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Like New, Used, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. London, UK" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Listing Duration</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="7">7 days</SelectItem>
                            <SelectItem value="14">14 days</SelectItem>
                            <SelectItem value="30">30 days</SelectItem>
                            <SelectItem value="60">60 days</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How long your listing will remain active
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                    {imageUrls.map((url, index) => (
                      <div 
                        key={index}
                        className="relative aspect-square rounded-md overflow-hidden border"
                      >
                        <img 
                          src={url} 
                          alt={`Listing image ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          className="absolute top-2 right-2 bg-background/80 hover:bg-background p-1 rounded-full"
                          onClick={() => removeImage(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                    
                    {images.length < 10 && (
                      <div className="aspect-square flex items-center justify-center border border-dashed rounded-md">
                        <label 
                          htmlFor="image-upload" 
                          className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
                        >
                          <ImagePlus className="h-8 w-8" />
                          <span className="text-sm">Add Image</span>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p className="mb-2">
                      <span className="font-medium">{images.length}/10</span> images uploaded
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Clear, well-lit photos from multiple angles perform best</li>
                      <li>Include close-ups of any defects or wear</li>
                      <li>Maximum file size: 5MB per image</li>
                    </ul>
                  </div>
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
