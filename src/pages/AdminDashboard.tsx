
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Check,
  CheckCircle,
  ChevronDown,
  FileCheck,
  Flag,
  Search,
  Shield,
  ShieldAlert,
  User,
  UserCheck,
  UserX,
  X,
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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

// Mock data for users pending verification
const pendingUsers = [
  {
    id: "u1",
    name: "Thomas Wilson",
    email: "thomas.wilson@example.com",
    registeredDate: "2023-04-15",
    referredBy: null,
    paymentStatus: "paid",
    status: "pending",
  },
  {
    id: "u2",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    registeredDate: "2023-04-16",
    referredBy: "James Smith",
    paymentStatus: "referral",
    status: "pending",
  },
  {
    id: "u3",
    name: "Robert Brown",
    email: "robert.brown@example.com",
    registeredDate: "2023-04-16",
    referredBy: null,
    paymentStatus: "paid",
    status: "pending",
  },
  {
    id: "u4",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    registeredDate: "2023-04-17",
    referredBy: "Michael Thompson",
    paymentStatus: "referral",
    status: "pending",
  },
];

// Mock data for listings pending approval
const pendingListings = [
  {
    id: "l1",
    title: "2022 Mercedes-Benz S-Class",
    seller: "James Smith",
    category: "cars",
    type: "auction",
    price: 78500,
    created: "2023-04-17",
    status: "pending",
  },
  {
    id: "l2",
    title: "Rolex Daytona 116500LN",
    seller: "Michael Thompson",
    category: "watches",
    type: "classified",
    price: 32000,
    created: "2023-04-17",
    status: "pending",
  },
  {
    id: "l3",
    title: "Riverside Villa - Sussex",
    seller: "Robert Johnson",
    category: "homes",
    type: "auction",
    price: 850000,
    created: "2023-04-18",
    status: "pending",
  },
];

// Mock data for flagged content
const flaggedItems = [
  {
    id: "f1",
    type: "message",
    content: "Please call me at 07700 900000 to discuss...",
    reporter: "System",
    reason: "Contains contact information",
    date: "2023-04-17",
    user: "Thomas Wilson",
    strikes: 1,
  },
  {
    id: "f2",
    type: "listing",
    content: "Luxury Watch Collection",
    reporter: "James Smith",
    reason: "Suspicious listing - potential counterfeit",
    date: "2023-04-16",
    user: "Robert Brown",
    strikes: 0,
  },
  {
    id: "f3",
    type: "message",
    content: "Let's talk outside the platform, my email is...",
    reporter: "System",
    reason: "Contains contact information",
    date: "2023-04-18",
    user: "Sarah Johnson",
    strikes: 2,
  },
];

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const approveUser = (userId: string) => {
    // This would connect to your API in a real app
    console.log(`Approving user ${userId}`);
    toast({
      title: "User approved",
      description: "User has been verified and can now access the platform",
    });
  };

  const rejectUser = (userId: string) => {
    // This would connect to your API in a real app
    console.log(`Rejecting user ${userId}`);
    toast({
      title: "User rejected",
      description: "User has been rejected and notified via email",
    });
  };

  const approveListing = (listingId: string) => {
    // This would connect to your API in a real app
    console.log(`Approving listing ${listingId}`);
    toast({
      title: "Listing approved",
      description: "Listing is now live on the platform",
    });
  };

  const rejectListing = (listingId: string) => {
    // This would connect to your API in a real app
    console.log(`Rejecting listing ${listingId}`);
    toast({
      title: "Listing rejected",
      description: "Seller has been notified",
    });
  };

  const handleFlaggedItem = (itemId: string, action: string) => {
    // This would connect to your API in a real app
    console.log(`${action} flagged item ${itemId}`);
    toast({
      title: action === "ignore" ? "Item ignored" : "Warning issued",
      description: action === "ignore" 
        ? "Flagged item has been marked as reviewed" 
        : "User has been warned about violating platform rules",
    });
  };

  return (
    <MainLayout>
      <div className="container py-6 md:py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage users, listings, and platform activity.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full md:w-[200px] pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Verifications
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                +5 since yesterday
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Listings To Review
              </CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                -2 since yesterday
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Flagged Content
              </CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">
                +3 since yesterday
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Active Users
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">542</div>
              <p className="text-xs text-muted-foreground">
                +18 this week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="verifications" className="space-y-4">
          <TabsList>
            <TabsTrigger value="verifications">Verifications</TabsTrigger>
            <TabsTrigger value="listingApprovals">Listing Approvals</TabsTrigger>
            <TabsTrigger value="flaggedContent">Flagged Content</TabsTrigger>
            <TabsTrigger value="platformStats">Platform Stats</TabsTrigger>
          </TabsList>

          {/* Verifications Tab */}
          <TabsContent value="verifications">
            <Card>
              <CardHeader>
                <CardTitle>Pending User Verifications</CardTitle>
                <CardDescription>
                  Approve or reject new user registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Registration Date</TableHead>
                      <TableHead>Referral</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.registeredDate}</TableCell>
                        <TableCell>
                          {user.referredBy ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                              {user.referredBy}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.paymentStatus === "paid" ? (
                            <Badge className="bg-green-500 hover:bg-green-600">Paid</Badge>
                          ) : (
                            <Badge variant="outline">Referral</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 hover:bg-yellow-50">
                            Pending
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-green-600"
                              onClick={() => approveUser(user.id)}
                            >
                              <Check className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button
                              variant="outline" 
                              size="sm"
                              className="h-8 text-red-600"
                              onClick={() => rejectUser(user.id)}
                            >
                              <X className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing 4 of 24 pending verifications
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Listing Approvals Tab */}
          <TabsContent value="listingApprovals">
            <Card>
              <CardHeader>
                <CardTitle>Pending Listing Approvals</CardTitle>
                <CardDescription>
                  Review and approve new listings before they go live
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Listing</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingListings.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell>
                          <div className="font-medium">{listing.title}</div>
                        </TableCell>
                        <TableCell>{listing.seller}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {listing.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={listing.type === "auction" ? "default" : "secondary"} className="capitalize">
                            {listing.type}
                          </Badge>
                        </TableCell>
                        <TableCell>£{listing.price.toLocaleString()}</TableCell>
                        <TableCell>{listing.created}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-green-600"
                              onClick={() => approveListing(listing.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-red-600"
                              onClick={() => rejectListing(listing.id)}
                            >
                              Reject
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Link to={`/admin/listings/${listing.id}`} className="w-full">
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>Request Changes</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">Flag as Inappropriate</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing 3 of 12 pending listings
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Flagged Content Tab */}
          <TabsContent value="flaggedContent">
            <Card>
              <CardHeader>
                <CardTitle>Flagged Content</CardTitle>
                <CardDescription>
                  Review content that has been flagged by users or the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Reporter</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Strikes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flaggedItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Badge variant={item.type === "message" ? "outline" : "default"} className="capitalize">
                            {item.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate font-medium">
                            {item.content}
                          </div>
                        </TableCell>
                        <TableCell>{item.user}</TableCell>
                        <TableCell>{item.reporter}</TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate">
                            {item.reason}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {item.strikes > 0 ? (
                              <Badge variant={item.strikes >= 2 ? "destructive" : "outline"} className="mr-2">
                                {item.strikes}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="mr-2">0</Badge>
                            )}
                            {item.strikes >= 2 && <AlertTriangle className="h-4 w-4 text-red-500" />}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8"
                              onClick={() => handleFlaggedItem(item.id, "warn")}
                            >
                              <ShieldAlert className="h-4 w-4 mr-1" /> Warn User
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8"
                              onClick={() => handleFlaggedItem(item.id, "ignore")}
                            >
                              Ignore
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Full Content</DropdownMenuItem>
                                <DropdownMenuItem>Contact User</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">Ban User</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing 3 of 7 flagged items
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Platform Stats Tab */}
          <TabsContent value="platformStats">
            <Card>
              <CardHeader>
                <CardTitle>Platform Statistics</CardTitle>
                <CardDescription>
                  Overview of platform performance and activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Users
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">542</div>
                      <p className="text-xs text-muted-foreground">
                        Verified: 389 • Unverified: 153
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Active Listings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">827</div>
                      <p className="text-xs text-muted-foreground">
                        Auctions: 342 • Classifieds: 485
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Completed Trades
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">2,184</div>
                      <p className="text-xs text-muted-foreground">
                        Last 30 days: 187
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Trade Value
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">£12.7M</div>
                      <p className="text-xs text-muted-foreground">
                        Last 30 days: £1.2M
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">User Growth</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-md">
                          <p className="text-muted-foreground">Chart placeholder: User growth over time</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Listing Categories</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-md">
                          <p className="text-muted-foreground">Chart placeholder: Listings by category</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Platform Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-md">
                        <p className="text-muted-foreground">Chart placeholder: Daily active users, new listings, and messages</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
