
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
import { Search } from "lucide-react";

interface UsersTabProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  userFilter: string;
  setUserFilter: (f: string) => void;
  filteredUsers: any[];
  formatDate: (dateString: string) => string;
  handleSuspendUser: (id: string) => void;
  handleUnsuspendUser: (id: string) => void;
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
}) => {
  useEffect(() => {
    console.log("UsersTab - filteredUsers:", filteredUsers);
    console.log("UsersTab - admin users:", filteredUsers.filter(u => u.role === "admin").map(u => u.full_name));
  }, [filteredUsers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Listings</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  No users found matching your search criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                console.log(`Rendering user ${user.full_name} with role: ${user.role}`);
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
                      <Badge
                        variant={
                          user.status === 'active'
                            ? 'outline'
                            : user.status === 'warning'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>{user.listings_count}</TableCell>
                    <TableCell className="text-right">
                      {user.status === 'suspended' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnsuspendUser(user.id)}
                        >
                          Unsuspend
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuspendUser(user.id)}
                          disabled={user.role === 'admin'}
                        >
                          Suspend
                        </Button>
                      )}
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
