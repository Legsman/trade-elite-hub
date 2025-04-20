
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bell,
  Clock,
  Eye,
  Heart,
  ListFilter,
  MessageSquare,
  PackageOpen,
  Plus,
  ShoppingCart,
  Star,
  Truck,
  TrendingUp,
  Users,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data - this would come from your API in a real application
const recentListings = [
  {
    id: "l1",
    title: "2019 Porsche 911 Carrera 4S",
    price: 88500,
    category: "cars",
    views: 52,
    saves: 7,
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    timeLeft: "2 days",
  },
  {
    id: "l2",
    title: "Patek Philippe Nautilus 5711",
    price: 68000,
    category: "watches",
    views: 129,
    saves: 24,
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    timeLeft: "6 hours",
  },
  {
    id: "l3",
    title: "Mercedes-Benz Sprinter 2022",
    price: 42000,
    category: "commercials",
    views: 37,
    saves: 3,
    image: "https://images.unsplash.com/photo-1609140099741-03a49e6b4ce3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    timeLeft: "5 days",
  },
  {
    id: "l4",
    title: "Luxury Penthouse - Central London",
    price: 1250000,
    category: "homes",
    views: 86,
    saves: 15,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    timeLeft: "12 days",
  },
];

const recentMessages = [
  {
    id: "m1",
    from: "David Thompson",
    message: "I'm interested in the Porsche you listed. Is the price negotiable?",
    time: "2 hours ago",
    read: false,
    listingTitle: "2019 Porsche 911 Carrera 4S",
  },
  {
    id: "m2",
    from: "Sarah Wilson",
    message: "Can you provide more details about the condition of the watch?",
    time: "Yesterday",
    read: true,
    listingTitle: "Patek Philippe Nautilus 5711",
  },
  {
    id: "m3",
    from: "Mark Lewis",
    message: "Is the property still available? I'd like to arrange a viewing.",
    time: "2 days ago",
    read: true,
    listingTitle: "Luxury Penthouse - Central London",
  },
];

const Dashboard = () => {
  const [period, setPeriod] = useState("7d");

  // Mock user data - this would come from auth context in a real app
  const user = {
    name: "John Smith",
    role: "verified",
    listingCount: 7,
    viewsThisWeek: 248,
    messageCount: 15,
    savedItems: 12,
    salesThisMonth: 3,
    salesValue: 175000,
  };

  return (
    <MainLayout>
      <div className="container py-6 md:py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.name}. Here's what's happening with your listings.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <Button asChild>
              <Link to="/listings/create">
                <Plus className="mr-2 h-4 w-4" /> Create Listing
              </Link>
            </Button>
            <Button variant="outline">
              <Bell className="mr-2 h-4 w-4" /> Notifications
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Listings
              </CardTitle>
              <PackageOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.listingCount}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Views This Week
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.viewsThisWeek}</div>
              <p className="text-xs text-muted-foreground">
                +19% from last week
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
              <div className="text-2xl font-bold">{user.messageCount}</div>
              <p className="text-xs text-muted-foreground">
                5 new since yesterday
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sales This Month
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.salesThisMonth}</div>
              <p className="text-xs text-muted-foreground">
                £{user.salesValue.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="listings">Listings</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <ListFilter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              {/* Activity chart */}
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Activity Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-md">
                    <BarChart className="h-16 w-16 text-muted-foreground" />
                    <p className="ml-2 text-sm text-muted-foreground">Activity chart would render here</p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Recent activity */}
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest updates on your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-purple/20 flex items-center justify-center text-purple">
                        <Eye className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Listing viewed</p>
                        <p className="text-xs text-muted-foreground">Someone viewed your Patek Philippe listing</p>
                        <p className="text-xs text-muted-foreground">3 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-purple/20 flex items-center justify-center text-purple">
                        <Heart className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Listing saved</p>
                        <p className="text-xs text-muted-foreground">Your Porsche listing was saved by a user</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-purple/20 flex items-center justify-center text-purple">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">New message</p>
                        <p className="text-xs text-muted-foreground">David sent you a message about your Porsche</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                        <ShoppingCart className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Sale completed</p>
                        <p className="text-xs text-muted-foreground">You sold the Rolex Daytona for £28,500</p>
                        <p className="text-xs text-muted-foreground">Yesterday</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Listings */}
            <div>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Listings</CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/listings">View all</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {recentListings.map((listing) => (
                      <Link key={listing.id} to={`/listings/${listing.id}`}>
                        <div className="group rounded-lg border overflow-hidden hover:shadow-md transition-shadow">
                          <div className="aspect-video relative">
                            <img
                              src={listing.image}
                              alt={listing.title}
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 right-2 bg-background/90 rounded-full px-2 py-1 text-xs font-medium flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {listing.timeLeft}
                            </div>
                          </div>
                          <div className="p-3">
                            <h3 className="font-medium text-sm line-clamp-1">{listing.title}</h3>
                            <p className="text-purple font-bold">
                              £{listing.price.toLocaleString()}
                            </p>
                            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center">
                                <Eye className="h-3 w-3 mr-1" /> {listing.views}
                              </span>
                              <span className="flex items-center">
                                <Heart className="h-3 w-3 mr-1" /> {listing.saves}
                              </span>
                              <span className="capitalize">{listing.category}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Messages & Performance */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Recent Messages */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Messages</CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/messages">View all</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentMessages.map((message) => (
                      <div key={message.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className={`w-2 h-2 mt-2 rounded-full ${message.read ? 'bg-muted' : 'bg-purple'}`} />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{message.from}</p>
                            <p className="text-xs text-muted-foreground">{message.time}</p>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {message.message}
                          </p>
                          <p className="text-xs">Re: {message.listingTitle}</p>
                          {!message.read && (
                            <div className="flex mt-2">
                              <Button variant="outline" size="sm" className="h-7 text-xs">
                                Reply
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 text-xs ml-2">
                                Mark as read
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button asChild variant="ghost" className="w-full">
                    <Link to="/messages">View all messages</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance</CardTitle>
                  <CardDescription>
                    Your account metrics and targets
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Annual Sales Target</p>
                        <p className="text-xs text-muted-foreground">5 items or £25,000</p>
                      </div>
                      <div className="font-medium">3/5 items</div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="bg-purple h-full w-3/5" />
                    </div>
                  </div>
                  
                  <div>
                    <div className="space-y-1 mb-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Listing Views</p>
                        <p className="text-xs text-green-500 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" /> +12.5%
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Compared to previous period
                      </p>
                    </div>
                    <div className="h-[100px] flex items-center justify-center bg-muted/20 rounded-md">
                      <TrendingUp className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-sm font-medium">Reputation Score</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < 4 ? "text-yellow-400 fill-yellow-400" : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm font-medium">4.0/5.0</div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Based on 8 completed transactions
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="listings">
            <Card>
              <CardHeader>
                <CardTitle>Your Listings</CardTitle>
                <CardDescription>
                  Manage your active and pending listings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                  <PackageOpen className="h-16 w-16 text-muted-foreground" />
                  <p className="ml-2 text-muted-foreground">Listings would be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>
                  View and respond to inquiries about your listings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                  <MessageSquare className="h-16 w-16 text-muted-foreground" />
                  <p className="ml-2 text-muted-foreground">Messages would be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  Track performance metrics for your listings and sales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                  <BarChart className="h-16 w-16 text-muted-foreground" />
                  <p className="ml-2 text-muted-foreground">Analytics would be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
