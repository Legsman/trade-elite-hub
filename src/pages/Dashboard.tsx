import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Heart, 
  MessageSquare, 
  BarChart2, 
  Star, 
  User, 
  Bell
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";
import { Loading } from "@/components/ui/loading";
import { toast } from "@/hooks/use-toast";

type Profile = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  postcode?: string | null;
  country?: string | null;
  phone_number?: string | null;
  company_name?: string | null;
  trading_address?: string | null;
  is_two_factor_enabled?: boolean | null;
  feedback_rating?: number | null;
  annual_2fa_payment_date?: string | null;
  referred_by?: string | null;
  signup_date?: string | null;
  strike_count?: number | null;
  created_at: string;
  updated_at: string;
};

type Listing = {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  price: number;
  location: string;
  condition: string;
  images: string[];
  allow_best_offer: boolean;
  expires_at: string;
  created_at: string;
  updated_at: string;
  status: string;
  views: number;
  saves: number;
};

type SavedListing = {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
  listings?: Listing;
};

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  listing_id?: string;
  content: string;
  is_read: boolean;
  created_at: string;
  has_contact_info: boolean;
  listings?: {
    id: string;
    title: string;
  };
  sender_profile?: {
    full_name: string;
  };
  receiver_profile?: {
    full_name: string;
  };
};

type Notification = {
  id: string;
  user_id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  metadata?: {
    description?: string;
    [key: string]: any;
  };
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [listings, setListings] = useState<Listing[]>([]);
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData as Profile);

        const { data: listingsData, error: listingsError } = await supabase
          .from('listings')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });

        if (listingsError) throw listingsError;
        setListings(listingsData as Listing[] || []);

        const { data: savedData, error: savedError } = await supabase
          .from('saved_listings')
          .select(`
            id,
            listing_id,
            created_at,
            listings:listing_id (
              id, 
              title, 
              price, 
              images, 
              status
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (savedError) throw savedError;
        setSavedListings(savedData as unknown as SavedListing[] || []);

        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select(`
            id,
            content,
            created_at,
            is_read,
            listing_id,
            sender_id,
            receiver_id,
            listings:listing_id (
              id,
              title
            ),
            sender_profile:sender_id (
              full_name
            ),
            receiver_profile:receiver_id (
              full_name
            )
          `)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(10);

        if (messagesError) throw messagesError;
        setMessages(messagesData as unknown as Message[] || []);

        const { data: notificationsData, error: notificationsError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (notificationsError) throw notificationsError;
        setNotifications(notificationsData as Notification[] || []);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error loading dashboard",
          description: "Failed to load your dashboard data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleViewListing = (id: string) => {
    navigate(`/listings/${id}`);
  };

  const handleEditListing = (id: string) => {
    navigate(`/listings/edit/${id}`);
  };

  const handleCreateListing = () => {
    navigate('/listings/create');
  };

  const handleMessages = () => {
    navigate('/messages');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-12">
          <Loading message="Loading your dashboard..." />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {profile?.full_name || user?.email}
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleCreateListing}>
              <FileText className="mr-2 h-4 w-4" />
              Create Listing
            </Button>
            <Button variant="outline" onClick={handleSettings}>
              <User className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-5 sm:w-[600px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="notifications">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Listings
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {listings.filter(l => l.status === 'active').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {listings.length} total listings
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Saved Items
                  </CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{savedListings.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Items you're watching
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Unread Messages
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {messages.filter(m => !m.is_read && m.receiver_id === user?.id).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {messages.length} total messages
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Notifications
                  </CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {notifications.filter(n => !n.is_read).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {notifications.length} total notifications
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest listings, messages and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {listings.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Latest Listings</h3>
                      <div className="space-y-2">
                        {listings.slice(0, 3).map((listing) => (
                          <div
                            key={listing.id}
                            className="flex items-center justify-between rounded-md border p-3"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-md bg-muted flex-shrink-0">
                                {listing.images.length > 0 && (
                                  <img
                                    src={listing.images[0]}
                                    alt={listing.title}
                                    className="h-full w-full object-cover rounded-md"
                                  />
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{listing.title}</div>
                                <div className="text-sm text-muted-foreground">
                                  £{listing.price.toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant={
                                listing.status === "active"
                                  ? "default"
                                  : listing.status === "pending"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {listing.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3">
                        <Button variant="link" className="px-0" onClick={() => {
                          const element = document.querySelector('[data-value="listings"]') as HTMLElement;
                          if (element) {
                            element.click();
                          }
                        }}>
                          View all listings
                        </Button>
                      </div>
                    </div>
                  )}

                  {messages.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium mb-2">Latest Messages</h3>
                      <div className="space-y-2">
                        {messages.slice(0, 3).map((message) => (
                          <div
                            key={message.id}
                            className="flex items-start justify-between rounded-md border p-3"
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <Avatar>
                                  <AvatarFallback>
                                    {message.sender_id === user?.id 
                                      ? message.receiver_profile?.full_name?.charAt(0) || 'U'
                                      : message.sender_profile?.full_name?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                              <div>
                                <div className="font-medium">
                                  {message.sender_id === user?.id 
                                    ? `To: ${message.receiver_profile?.full_name || "User"}`
                                    : `From: ${message.sender_profile?.full_name || "User"}`}
                                </div>
                                <div className="text-sm line-clamp-1">{message.content}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {formatDate(message.created_at)}
                                </div>
                              </div>
                            </div>
                            {!message.is_read && message.receiver_id === user?.id && (
                              <Badge>New</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-3">
                        <Button variant="link" className="px-0" onClick={handleMessages}>
                          View all messages
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="listings" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold tracking-tight">Your Listings</h2>
              <Button onClick={handleCreateListing}>
                <FileText className="mr-2 h-4 w-4" />
                Create New Listing
              </Button>
            </div>

            {listings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Listings Yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    You haven't created any listings yet. Create your first listing to start selling.
                  </p>
                  <Button onClick={handleCreateListing}>Create Listing</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {listings.map((listing) => (
                  <Card key={listing.id} className="overflow-hidden">
                    <div className="aspect-video relative">
                      {listing.images.length > 0 ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-muted flex items-center justify-center">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge
                          variant={
                            listing.status === "active"
                              ? "default"
                              : listing.status === "pending"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {listing.status}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg line-clamp-1">{listing.title}</h3>
                      <p className="text-muted-foreground text-sm mb-2">
                        {listing.location}
                      </p>
                      <p className="font-bold text-lg mb-2">
                        £{listing.price.toLocaleString()}
                      </p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span>Views: {listing.views}</span>
                        <Separator orientation="vertical" className="mx-2 h-4" />
                        <span>Saves: {listing.saves}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2 p-4 pt-0">
                      <Button
                        variant="default"
                        className="flex-1"
                        onClick={() => handleViewListing(listing.id)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleEditListing(listing.id)}
                      >
                        Edit
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">Saved Listings</h2>

            {savedListings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Saved Listings</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    You haven't saved any listings yet. Browse listings and click the heart icon to save them for later.
                  </p>
                  <Button onClick={() => navigate('/listings')}>Browse Listings</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {savedListings.map((saved) => {
                  const listing = saved.listings;
                  if (!listing) return null;
                  
                  return (
                    <Card key={saved.id} className="overflow-hidden">
                      <div className="aspect-video relative">
                        {listing.images.length > 0 ? (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-muted flex items-center justify-center">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        {listing.status !== "active" && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="outline">{listing.status}</Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg line-clamp-1">{listing.title}</h3>
                        <p className="font-bold text-lg mb-2">
                          £{listing.price.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Saved on {formatDate(saved.created_at)}
                        </p>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button
                          className="w-full"
                          onClick={() => handleViewListing(listing.id)}
                        >
                          View Listing
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold tracking-tight">Messages</h2>
              <Button onClick={handleMessages}>
                <MessageSquare className="mr-2 h-4 w-4" />
                View All Messages
              </Button>
            </div>

            {messages.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Messages</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    You don't have any messages yet. When you contact sellers or receive messages, they'll appear here.
                  </p>
                  <Button onClick={() => navigate('/listings')}>Browse Listings</Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {messages.map((message) => {
                      const isSender = message.sender_id === user.id;
                      const otherUser = isSender 
                        ? message.receiver_profile?.full_name || "User"
                        : message.sender_profile?.full_name || "User";
                      
                      return (
                        <div
                          key={message.id}
                          className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => navigate(`/messages?contact=${isSender ? message.receiver_id : message.sender_id}`)}
                        >
                          <div className="flex items-start space-x-4">
                            <Avatar>
                              <AvatarFallback>
                                {otherUser.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium">
                                  {isSender ? `To: ${otherUser}` : `From: ${otherUser}`}
                                </p>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(message.created_at)}
                                </span>
                              </div>
                              {message.listing_id && (
                                <p className="text-xs text-muted-foreground">
                                  Re: {message.listings?.title || "Listing"}
                                </p>
                              )}
                              <p className="text-sm line-clamp-2">{message.content}</p>
                            </div>
                            {!message.is_read && message.receiver_id === user.id && (
                              <Badge className="ml-2">New</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
                <CardFooter className="border-t p-4">
                  <Button variant="outline" className="w-full" onClick={handleMessages}>
                    View All Messages
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">Notifications</h2>

            {notifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Notifications</h3>
                  <p className="text-muted-foreground text-center">
                    You don't have any notifications yet. We'll notify you about important updates and activities.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 ${!notification.is_read ? 'bg-muted/50' : ''}`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {notification.type === 'message' && <MessageSquare className="h-5 w-5 text-primary" />}
                            {notification.type === 'listing' && <FileText className="h-5 w-5 text-primary" />}
                            {notification.type === 'saved' && <Heart className="h-5 w-5 text-primary" />}
                            {notification.type === 'feedback' && <Star className="h-5 w-5 text-primary" />}
                            {notification.type === 'system' && <Bell className="h-5 w-5 text-primary" />}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{notification.message}</p>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(notification.created_at)}
                              </span>
                            </div>
                            {notification.metadata && notification.metadata.description && (
                              <p className="text-sm text-muted-foreground">
                                {notification.metadata.description}
                              </p>
                            )}
                          </div>
                          {!notification.is_read && (
                            <Badge>New</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                {notifications.some(n => !n.is_read) && (
                  <CardFooter className="border-t p-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={async () => {
                        try {
                          await supabase
                            .from('notifications')
                            .update({ is_read: true })
                            .eq('user_id', user?.id)
                            .eq('is_read', false);
                          
                          setNotifications(prev => 
                            prev.map(n => ({ ...n, is_read: true }))
                          );
                          
                          toast({
                            title: "Notifications marked as read",
                            description: "All notifications have been marked as read",
                          });
                        } catch (error) {
                          console.error('Error marking notifications as read:', error);
                          toast({
                            title: "Error",
                            description: "Failed to mark notifications as read",
                            variant: "destructive"
                          });
                        }
                      }}
                    >
                      Mark All as Read
                    </Button>
                  </CardFooter>
                )}
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
