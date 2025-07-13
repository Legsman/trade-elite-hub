
import React, { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2, RefreshCw } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAdminDashboardContext } from "../context/AdminDashboardContext";

const UsersTab: React.FC = () => {
  const {
    searchQuery = "",
    setSearchQuery = () => {},
    userFilter = "all",
    setUserFilter = () => {},
    filteredUsers = [],
    formatDate,
    handleSuspendUser = () => {},
    handleUnsuspendUser = () => {},
    toggleVerifiedStatus = () => {},
    toggleTraderStatus = () => {},
    isPendingForUser = () => false,
    isRefetching = false,
    onRefresh = () => {},
  } = useAdminDashboardContext();

  useEffect(() => {
    console.log("UsersTab - filteredUsers:", filteredUsers);
    console.log("UsersTab - verified users:", filteredUsers.filter(u => u.verified_status === "verified").map(u => u.full_name));
  }, [filteredUsers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
            <SelectItem value="trader">Trader</SelectItem>
          </SelectContent>
        </Select>
        
        {onRefresh && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onRefresh} 
            disabled={isRefetching}
            className="flex items-center gap-2"
          >
            {isRefetching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Verification Level</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Visited</TableHead>
              <TableHead>Listings</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6">
                  No users found matching your search criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const isLoading = isPendingForUser(user.id);
                console.log(`Rendering user ${user.full_name} with role: ${user.role}, verified: ${user.verified_status}`);
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.role === 'admin' ? (
                        <Badge variant="default">Admin</Badge>
                      ) : (
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`unverified-${user.id}`}
                              checked={user.verified_status === "unverified"}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  toggleVerifiedStatus(user.id, "unverified");
                                }
                              }}
                              disabled={isLoading || isRefetching || user.verified_status === "unverified"}
                            />
                            <Label htmlFor={`unverified-${user.id}`} className="text-sm">
                              Unverified
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`verified-${user.id}`}
                              checked={user.verified_status === "verified"}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  toggleVerifiedStatus(user.id, "verified");
                                }
                              }}
                              disabled={isLoading || isRefetching || user.verified_status === "verified"}
                            />
                            <Label htmlFor={`verified-${user.id}`} className="text-sm">
                              Verified
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`trader-${user.id}`}
                              checked={user.verified_status === "trader"}
                              onCheckedChange={(checked) => {
                                if (checked && user.verified_status === "verified") {
                                  toggleTraderStatus(user.id, "verified");
                                } else if (!checked && user.verified_status === "trader") {
                                  toggleTraderStatus(user.id, "trader");
                                }
                              }}
                              disabled={isLoading || isRefetching || user.verified_status === "unverified"}
                            />
                            <Label htmlFor={`trader-${user.id}`} className="text-sm">
                              Trader
                            </Label>
                          </div>
                          {isLoading && (
                            <div className="flex items-center">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="ml-2 text-sm">Updating...</span>
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>{user.last_visited ? formatDate(user.last_visited) : "Never"}</TableCell>
                    <TableCell>{user.listings_count}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => user.strike_count >= 3 ? handleUnsuspendUser(user.id) : handleSuspendUser(user.id)}
                        disabled={user.role === 'admin' || isRefetching || isLoading}
                      >
                        {user.strike_count >= 3 ? "Unsuspend" : "Suspend"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UsersTab;
