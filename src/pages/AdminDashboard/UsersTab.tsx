
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface UsersTabProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  userFilter: string;
  setUserFilter: (f: string) => void;
  filteredUsers: any[];
  formatDate: (dateString: string) => string;
  handleSuspendUser: (id: string) => void;
  handleUnsuspendUser: (id: string) => void;
  toggleVerifiedStatus: (userId: string, currentStatus: "verified" | "unverified") => void;
  isPendingForUser?: (userId: string) => boolean;
  isRefetching?: boolean;
  onRefresh?: () => void;
}

const UsersTab: React.FC<UsersTabProps> = ({
  searchQuery,
  setSearchQuery,
  userFilter,
  setUserFilter,
  filteredUsers,
  formatDate,
  handleSuspendUser,
  handleUnsuspendUser,
  toggleVerifiedStatus,
  isPendingForUser = () => false,
  isRefetching,
  onRefresh
}) => {
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
              <TableHead>Verified</TableHead>
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
                        <Badge variant="default">Always Verified</Badge>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`verify-${user.id}`}
                            checked={user.verified_status === "verified"}
                            onCheckedChange={() => toggleVerifiedStatus(user.id, user.verified_status)}
                            disabled={isLoading || isRefetching}
                          />
                          <Label htmlFor={`verify-${user.id}`}>
                            {isLoading ? (
                              <span className="flex items-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                              </span>
                            ) : (
                              user.verified_status === "verified" ? "Verified" : "Unverified"
                            )}
                          </Label>
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
}

export default UsersTab;
