import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, CheckCircle, Clock, Eye, RefreshCw, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface VerificationRequest {
  id: string;
  user_id: string;
  request_type: "verified" | "trader";
  status: "pending" | "approved" | "rejected";
  message?: string;
  business_name?: string;
  business_registration?: string;
  trading_experience?: string;
  requested_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  admin_notes?: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export function VerificationRequestsTab() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("verification_requests")
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .order("requested_at", { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(item => ({
        ...item,
        profiles: Array.isArray(item.profiles) && item.profiles.length > 0 
          ? item.profiles[0] 
          : item.profiles
      }));
      
      setRequests(transformedData as VerificationRequest[]);
    } catch (error) {
      console.error("Error fetching verification requests:", error);
      toast({
        title: "Error",
        description: "Failed to load verification requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: "approved" | "rejected") => {
    try {
      setIsProcessing(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update verification request status
      const { error: updateError } = await supabase
        .from("verification_requests")
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          admin_notes: adminNotes,
        })
        .eq("id", requestId);

      if (updateError) throw updateError;

      // If approved, update user roles
      if (newStatus === "approved" && selectedRequest) {
        const roleType = selectedRequest.request_type;
        
        // Remove existing unverified role
        await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", selectedRequest.user_id)
          .eq("role", "unverified");

        // Add new role
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: selectedRequest.user_id,
            role: roleType,
          });

        if (roleError) throw roleError;

        // Create notification
        await supabase
          .from("notifications")
          .insert({
            user_id: selectedRequest.user_id,
            type: "verification_approved",
            message: `Your ${roleType} verification request has been approved!`,
            metadata: { verification_type: roleType },
          });
      } else if (newStatus === "rejected" && selectedRequest) {
        // Create rejection notification
        await supabase
          .from("notifications")
          .insert({
            user_id: selectedRequest.user_id,
            type: "verification_rejected",
            message: `Your ${selectedRequest.request_type} verification request has been rejected.`,
            metadata: { 
              verification_type: selectedRequest.request_type,
              admin_notes: adminNotes 
            },
          });
      }

      toast({
        title: "Success",
        description: `Verification request ${newStatus} successfully`,
      });

      fetchRequests();
      setSelectedRequest(null);
      setAdminNotes("");
    } catch (error) {
      console.error("Error updating verification request:", error);
      toast({
        title: "Error",
        description: "Failed to update verification request",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-orange-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="text-red-600"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    return (
      <Badge variant={type === "trader" ? "default" : "secondary"}>
        {type === "trader" ? "Trader" : "Verified"}
      </Badge>
    );
  };

  const filteredRequests = requests.filter(request => 
    statusFilter === "all" || request.status === statusFilter
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Verification Requests</h3>
          <p className="text-sm text-muted-foreground">
            Review and manage user verification requests
          </p>
        </div>
        <Button onClick={fetchRequests} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="w-48">
          <Label htmlFor="status-filter">Filter by Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading verification requests...</div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No verification requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {request.profiles?.full_name || "Unknown User"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {request.profiles?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(request.request_type)}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        {format(new Date(request.requested_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request);
                                setAdminNotes(request.admin_notes || "");
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Verification Request Details</DialogTitle>
                              <DialogDescription>
                                Review and process this verification request
                              </DialogDescription>
                            </DialogHeader>
                            {selectedRequest && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">User</Label>
                                    <p>{selectedRequest.profiles?.full_name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {selectedRequest.profiles?.email}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Request Type</Label>
                                    <div className="mt-1">{getTypeBadge(selectedRequest.request_type)}</div>
                                  </div>
                                </div>

                                {selectedRequest.request_type === "trader" && (
                                  <div className="space-y-4">
                                    <div>
                                      <Label className="text-sm font-medium">Business Name</Label>
                                      <p>{selectedRequest.business_name || "Not provided"}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Business Registration</Label>
                                      <p>{selectedRequest.business_registration || "Not provided"}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Trading Experience</Label>
                                      <p className="whitespace-pre-wrap">
                                        {selectedRequest.trading_experience || "Not provided"}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {selectedRequest.message && (
                                  <div>
                                    <Label className="text-sm font-medium">Additional Information</Label>
                                    <p className="whitespace-pre-wrap">{selectedRequest.message}</p>
                                  </div>
                                )}

                                <div>
                                  <Label htmlFor="admin-notes">Admin Notes</Label>
                                  <Textarea
                                    id="admin-notes"
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add notes about this verification decision"
                                    rows={3}
                                  />
                                </div>

                                {selectedRequest.status === "pending" && (
                                  <div className="flex gap-3">
                                    <Button
                                      onClick={() => handleStatusChange(selectedRequest.id, "approved")}
                                      disabled={isProcessing}
                                      className="flex-1"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Approve
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleStatusChange(selectedRequest.id, "rejected")}
                                      disabled={isProcessing}
                                      className="flex-1"
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Reject
                                    </Button>
                                  </div>
                                )}

                                {selectedRequest.status !== "pending" && (
                                  <div className="p-4 bg-muted rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                      {getStatusBadge(selectedRequest.status)}
                                      {selectedRequest.reviewed_at && (
                                        <span className="text-sm text-muted-foreground">
                                          on {format(new Date(selectedRequest.reviewed_at), "MMM d, yyyy 'at' h:mm a")}
                                        </span>
                                      )}
                                    </div>
                                    {selectedRequest.admin_notes && (
                                      <p className="text-sm">{selectedRequest.admin_notes}</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}