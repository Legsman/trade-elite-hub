
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Heart, 
  Share2,
  MessageSquare,
  Clock,
  MapPin,
  Tag,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  User,
  Star,
  ThumbsUp
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { Listing } from "@/types";
import { Loading } from "@/components/ui/loading";
import { useAuth } from "@/hooks/auth";
import { toast } from "@/hooks/use-toast";

// Mocked data
const MOCK_LISTINGS: Listing[] = [
  {
    id: "1",
    sellerId: "user1",
    title: "2020 Ferrari 488 Pista",
    description: "The Ferrari 488 Pista is powered by the most powerful V8 engine in the Maranello marque's history and is the company's special series sports car with the highest level yet of technological transfer from racing. In fact the name, meaning 'track' in Italian, was chosen specifically to testify to Ferrari's unparalleled heritage in motor sports.\n\nThis car is in pristine condition with only 5,000 miles on the odometer. Full Ferrari service history with all books, keys, and accessories included. Rosso Corsa with black racing stripe and carbon fiber accents throughout.",
    category: "cars",
    type: "classified",
    price: 350000,
    location: "London, UK",
    condition: "Like New",
    images: [
      "https://images.unsplash.com/photo-1592198084033-aade902d1aae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1597840900201-394c2a05c784?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    allowBestOffer: true,
    expiresAt: new Date(2025, 5, 15),
    createdAt: new Date(2025, 2, 15),
    updatedAt: new Date(2025, 2, 15),
    status: "active",
    views: 245,
    saves: 18,
  },
];

interface SellerInfo {
  id: string;
  name: string;
  joinDate: Date;
  rating: number;
  salesCount: number;
  verified: boolean;
}

// Mocked seller data
const MOCK_SELLER: SellerInfo = {
  id: "user1",
  name: "James Wilson",
  joinDate: new Date(2023, 1, 15),
  rating: 4.9,
  salesCount: 37,
  verified: true,
};

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<SellerInfo | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  // In a real app, this would fetch from API
  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const foundListing = MOCK_LISTINGS.find(item => item.id === id);
        if (foundListing) {
          setListing(foundListing);
          setSeller(MOCK_SELLER);
        }
        setLoading(false);
      }, 800);
    };

    fetchListing();
  }, [id]);

  const toggleSave = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save listings",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Listing removed from saved items" : "Listing saved successfully",
      description: isSaved 
        ? "This listing has been removed from your saved items" 
        : "This listing has been added to your saved items",
    });
  };

  const handleContact = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to contact sellers",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would navigate to messages with this listing context
    navigate(`/messages/new?listing=${id}`);
  };

  const handlePrevImage = () => {
    if (!listing) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? listing.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (!listing) return;
    setCurrentImageIndex((prev) => 
      prev === listing.images.length - 1 ? 0 : prev + 1
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-12">
          <Loading message="Loading listing details..." />
        </div>
      </MainLayout>
    );
  }

  if (!listing) {
    return (
      <MainLayout>
        <div className="container py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Listing Not Found</h2>
          <p className="text-muted-foreground mb-6">The listing you are looking for does not exist or has been removed.</p>
          <Button onClick={() => navigate("/listings")}>Browse Listings</Button>
        </div>
      </MainLayout>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const daysUntilExpiry = Math.ceil(
    (listing.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <MainLayout>
      <div className="container py-8">
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => navigate("/listings")}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to listings
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Images and details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery */}
            <div className="relative rounded-lg overflow-hidden border">
              <div className="aspect-video relative">
                <img 
                  src={listing.images[currentImageIndex]} 
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                
                {listing.images.length > 1 && (
                  <>
                    <button 
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full"
                      onClick={handlePrevImage}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button 
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full"
                      onClick={handleNextImage}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                <div className="absolute bottom-4 right-4 bg-background/80 rounded-full px-3 py-1 text-sm">
                  {currentImageIndex + 1} / {listing.images.length}
                </div>
              </div>
              
              {listing.images.length > 1 && (
                <div className="p-2 flex gap-2 overflow-x-auto">
                  {listing.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-16 rounded overflow-hidden border-2 ${
                        idx === currentImageIndex 
                          ? "border-purple" 
                          : "border-transparent"
                      }`}
                    >
                      <img 
                        src={img} 
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Listing information */}
            <Tabs defaultValue="description" className="space-y-4">
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="shipping">Shipping</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="space-y-4">
                <div className="text-lg">
                  {listing.description.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Condition</span>
                    <span className="font-medium">{listing.condition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium capitalize">{listing.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Listing Type</span>
                    <span className="font-medium capitalize">{listing.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium">{listing.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Listed On</span>
                    <span className="font-medium">{formatDate(listing.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expires</span>
                    <span className="font-medium">{formatDate(listing.expiresAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Best Offer</span>
                    <span className="font-medium">{listing.allowBestOffer ? "Accepted" : "Not Accepted"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Item ID</span>
                    <span className="font-medium">{listing.id}</span>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="shipping" className="space-y-4">
                <p>
                  The seller is responsible for arranging shipping. Contact the seller for shipping options and costs.
                </p>
                <div className="p-4 bg-muted/40 rounded-lg">
                  <h4 className="font-medium mb-2">Shipping Terms</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Buyer is responsible for all shipping and handling costs</li>
                    <li>Items will be shipped within 7 business days of cleared payment</li>
                    <li>International buyers are responsible for any customs fees</li>
                    <li>Insurance is recommended for high-value items</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right column - Price and seller info */}
          <div className="space-y-6">
            {/* Price card */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">{listing.title}</h1>
                    <div className="flex items-center mt-1 text-muted-foreground text-sm">
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      {listing.location}
                    </div>
                  </div>
                  <Badge variant={listing.type === "auction" ? "secondary" : "outline"}>
                    {listing.type === "auction" ? "Auction" : "For Sale"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-purple">£{listing.price.toLocaleString()}</span>
                  {listing.type === "classified" && (
                    <Badge variant="outline" className="ml-2">
                      Fixed Price
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>
                    {daysUntilExpiry > 0 
                      ? `${daysUntilExpiry} days remaining` 
                      : "Listing expired"}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    className="flex-1"
                    onClick={handleContact}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact Seller
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant={isSaved ? "default" : "outline"} 
                          size="icon"
                          onClick={toggleSave}
                        >
                          <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                          <span className="sr-only">Save Listing</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isSaved ? "Remove from saved" : "Save for later"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Share2 className="h-4 w-4" />
                          <span className="sr-only">Share Listing</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Share this listing</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                {listing.allowBestOffer && (
                  <Button variant="outline" className="w-full">
                    Make an Offer
                  </Button>
                )}
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Views: {listing.views}</span>
                  <span>Saves: {listing.saves}</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Seller information */}
            {seller && (
              <Card>
                <CardHeader>
                  <CardTitle>Seller Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mr-3">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium flex items-center">
                        {seller.name}
                        {seller.verified && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Shield className="ml-1 h-4 w-4 text-green-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Verified Seller</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Member since {formatDate(seller.joinDate)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="font-medium">{seller.rating}</span>
                      <span className="text-sm text-muted-foreground ml-1">
                        ({seller.salesCount} sales)
                      </span>
                    </div>
                    <Button variant="link" size="sm" className="p-0" onClick={() => navigate(`/profile/${seller.id}`)}>
                      View Profile
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="p-3 border rounded-md bg-muted/20 text-sm">
                    <div className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                      <p>
                        Always communicate through SwiftTrade and never share personal contact details. 
                        Report suspicious activity immediately.
                      </p>
                    </div>
                  </div>
                  
                  <Button className="w-full" variant="outline" onClick={() => navigate(`/feedback/new?user=${seller.id}`)}>
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Leave Feedback
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {/* Safety tips */}
            <Card>
              <CardHeader>
                <CardTitle>Safety Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start">
                    <Shield className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Meet in public places for viewings or exchanges</span>
                  </li>
                  <li className="flex items-start">
                    <Shield className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Use our secure messaging system for all communications</span>
                  </li>
                  <li className="flex items-start">
                    <Shield className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Verify high-value items with an expert before purchase</span>
                  </li>
                  <li className="flex items-start">
                    <Shield className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Report suspicious listings or behavior to our team</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ListingDetails;
