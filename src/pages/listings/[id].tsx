
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Heart, 
  Share2,
  MessageSquare,
  MapPin,
  AlertCircle,
  ChevronLeft,
  Shield,
  User,
  Star,
  ThumbsUp,
  Loader2,
  Gavel
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/auth";
import { useListing, useBids } from "@/hooks/listings";
import { useSellerProfile } from "@/hooks/use-user-profile";
import { useStartConversation } from "@/hooks/use-message";
import { toast } from "@/hooks/use-toast";
import { useAnalytics } from "@/hooks/use-analytics";
import { Loading } from "@/components/ui/loading";
import { 
  ListingImageGallery, 
  ListingDetailsTabs, 
  ListingCountdown,
  AuctionSection,
  OfferSection 
} from "@/components/listings";

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { listing, isLoading: listingLoading, error: listingError, toggleSave, checkSaved } = useListing(id);
  const { seller, isLoading: sellerLoading } = useSellerProfile(listing?.sellerId);
  const { startConversation } = useStartConversation();
  const { trackEvent } = useAnalytics();
  const { highestBid } = useBids({ listingId: id });
  
  const [isSaved, setIsSaved] = useState(false);
  const [savingState, setSavingState] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  
  const isLoading = listingLoading || sellerLoading;

  // Check if the listing is saved
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (listing && user) {
        const savedStatus = await checkSaved();
        setIsSaved(savedStatus);
      }
    };
    
    checkSavedStatus();
  }, [listing, user, checkSaved]);

  // Track page view
  useEffect(() => {
    if (listing) {
      trackEvent("listing_view", { 
        listingId: listing.id,
        listingType: listing.type,
        listingCategory: listing.category,
        listingPrice: listing.price,
      });
    }
  }, [listing, trackEvent]);

  const handleToggleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save listings",
        variant: "destructive",
      });
      return;
    }
    
    setSavingState(true);
    const result = await toggleSave();
    setSavingState(false);
    
    if (result.success) {
      setIsSaved(result.saved);
      trackEvent("listing_saved", { 
        listingId: listing?.id,
        saved: result.saved
      });
    }
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
    
    // Open message dialog
    setMessageOpen(true);
    trackEvent("contact_seller_click", { listingId: listing?.id });
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message to send to the seller",
        variant: "destructive",
      });
      return;
    }
    
    setSendingMessage(true);
    
    const result = await startConversation(
      listing!.sellerId,
      messageContent,
      listing!.id
    );
    
    setSendingMessage(false);
    
    if (result.success) {
      setMessageOpen(false);
      setMessageContent("");
      
      toast({
        title: "Message sent",
        description: "Your message has been sent to the seller",
      });
      
      trackEvent("message_sent", { 
        listingId: listing?.id,
        sellerId: listing?.sellerId
      });
      
      // Redirect to messages
      navigate(`/messages`);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing?.title,
        text: `Check out this listing: ${listing?.title}`,
        url: window.location.href,
      }).then(() => {
        trackEvent("listing_shared", { listingId: listing?.id });
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast({
          title: "Link copied",
          description: "Listing link copied to clipboard",
        });
        trackEvent("listing_link_copied", { listingId: listing?.id });
      }).catch(console.error);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-12">
          <Loading message="Loading listing details..." />
        </div>
      </MainLayout>
    );
  }

  if (listingError || !listing) {
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

  const daysUntilExpiry = Math.ceil(
    (listing.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const isAuction = listing.type === "auction";
  const displayPrice = isAuction && highestBid ? highestBid : listing.price;

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
            <ListingImageGallery 
              images={listing.images}
              listingId={listing.id}
              title={listing.title}
            />

            {/* Listing information */}
            <ListingDetailsTabs listing={listing} />
            
            {/* Auction Bids / Make Offer Tab */}
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value={isAuction ? "bids" : "offers"}>
                  {isAuction ? "Bids" : "Make an Offer"}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Item Details</CardTitle>
                    <CardDescription>
                      More information about this {isAuction ? "auction" : "listing"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Item Condition</h4>
                          <p className="font-medium">{listing.condition}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                          <p className="font-medium capitalize">{listing.category}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                          <p className="font-medium">{listing.location}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Listing Type</h4>
                          <p className="font-medium capitalize">{listing.type}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Listed On</h4>
                          <p className="font-medium">{formatDate(listing.createdAt)}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Expires On</h4>
                          <p className="font-medium">{formatDate(listing.expiresAt)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
                      <div className="space-y-2">
                        {listing.description.split('\n\n').map((paragraph, idx) => (
                          <p key={idx}>{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="bids">
                {isAuction && (
                  <AuctionSection 
                    listingId={listing.id}
                    sellerId={listing.sellerId}
                    currentPrice={listing.price}
                    userId={user?.id}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="offers">
                {!isAuction && listing.allowBestOffer && (
                  <OfferSection 
                    listingId={listing.id}
                    listingTitle={listing.title}
                    sellerId={listing.sellerId}
                    currentPrice={listing.price}
                    userId={user?.id}
                  />
                )}
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
                  <Badge variant={isAuction ? "secondary" : "outline"}>
                    {isAuction ? "Auction" : "For Sale"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isAuction ? (
                  <div className="space-y-1">
                    {highestBid ? (
                      <div className="flex items-baseline">
                        <div className="flex items-center">
                          <Gavel className="h-4 w-4 mr-1 text-purple" />
                          <span className="text-sm text-muted-foreground">Current bid:</span>
                        </div>
                        <span className="text-3xl font-bold text-purple ml-2">£{highestBid.toLocaleString()}</span>
                      </div>
                    ) : (
                      <div className="flex items-baseline">
                        <div className="flex items-center">
                          <Gavel className="h-4 w-4 mr-1" />
                          <span className="text-sm text-muted-foreground">Starting bid:</span>
                        </div>
                        <span className="text-3xl font-bold text-purple ml-2">£{listing.price.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-purple">£{listing.price.toLocaleString()}</span>
                    {listing.allowBestOffer && (
                      <Badge variant="outline" className="ml-2">
                        Offers Accepted
                      </Badge>
                    )}
                  </div>
                )}
                
                {/* Countdown */}
                <ListingCountdown 
                  expiryDate={listing.expiresAt} 
                  isAuction={isAuction}
                />
                
                <div className="flex items-center gap-2">
                  <Button 
                    className="flex-1"
                    onClick={handleContact}
                    disabled={listing.sellerId === user?.id}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact Seller
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div> {/* Wrapper div to avoid button inside button warning */}
                          <Button 
                            variant={isSaved ? "default" : "outline"} 
                            size="icon"
                            onClick={handleToggleSave}
                            disabled={savingState || listing.sellerId === user?.id}
                          >
                            {savingState ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                            )}
                            <span className="sr-only">Save Listing</span>
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isSaved ? "Remove from saved" : "Save for later"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={handleShare}
                        >
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
                
                {!isAuction && listing.allowBestOffer && listing.sellerId !== user?.id && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setActiveTab("offers")}
                  >
                    Make an Offer
                  </Button>
                )}
                
                {isAuction && listing.sellerId !== user?.id && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setActiveTab("bids")}
                  >
                    Place a Bid
                  </Button>
                )}
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Views: {listing.views}</span>
                  <span>
                    {isAuction ? `Bids: ${listing.saves}` : `Saves: ${listing.saves}`}
                  </span>
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
                      {seller.avatarUrl ? (
                        <img 
                          src={seller.avatarUrl} 
                          alt={seller.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-muted-foreground" />
                      )}
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
                        Always communicate through our platform and never share personal contact details. 
                        Report suspicious activity immediately.
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    variant="outline" 
                    onClick={() => navigate(`/feedback/new?user=${seller.id}`)}
                  >
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

      {/* Contact seller dialog */}
      <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Seller</DialogTitle>
            <DialogDescription>
              Send a message to the seller about this listing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-4">
              <div className="rounded-md border p-2 w-16 h-16 flex-shrink-0">
                <img 
                  src={listing.images[0]} 
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-medium line-clamp-1">{listing.title}</h4>
                <p className="text-sm text-muted-foreground">£{displayPrice.toLocaleString()}</p>
              </div>
            </div>
            <Textarea
              placeholder="Write your message to the seller here..."
              className="min-h-[120px]"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
            />
            <div className="text-sm text-muted-foreground">
              <p className="flex items-start">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                Do not share personal contact details in your first message.
              </p>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setMessageOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              disabled={sendingMessage || !messageContent.trim()}
              onClick={handleSendMessage}
            >
              {sendingMessage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default ListingDetails;
