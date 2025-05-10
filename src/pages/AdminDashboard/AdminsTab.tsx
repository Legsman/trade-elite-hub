
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserAdmin } from "./types";
import { Loader2 } from "lucide-react";

interface AdminsTabProps {
  users: UserAdmin[];
  promoteAdmin: (userId: string) => void;
  demoteAdmin: (userId: string) => void;
  currentUserId: string;
  isPendingForUser?: (userId: string) => boolean;
  isRefetching?: boolean;
}

const AdminsTab: React.FC<AdminsTabProps> = ({ 
  users, 
  promoteAdmin, 
  demoteAdmin, 
  currentUserId,
  isPendingForUser = () => false,
  isRefetching
}) => {
  useEffect(() => {
    console.log("AdminsTab mounted with users:", users);
    console.log("AdminsTab users with admin role:", users.filter(user => user.role === "admin").map(u => `${u.full_name} (${u.id})`));
    console.log("Current user ID:", currentUserId);
  }, [users, currentUserId]);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Admin User Management</h2>
        {isRefetching && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Refreshing data...
          </div>
        )}
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isLoading = isPendingForUser(user.id);
              
              return (
                <TableRow key={user.id}>
                  <TableCell>{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "outline"}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.strike_count >= 3
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {user.strike_count >= 3 ? "Suspended" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.role !== "admin" ? (
                      <Button 
                        size="sm" 
                        onClick={() => promoteAdmin(user.id)}
                        disabled={isLoading || isRefetching}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Promoting...
                          </>
                        ) : (
                          "Make Admin"
                        )}
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => demoteAdmin(user.id)} 
                        disabled={user.id === currentUserId || isLoading || isRefetching}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Removing...
                          </>
                        ) : (
                          "Remove Admin"
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        You can't remove your own admin status.
      </p>
    </div>
  );
};

export default AdminsTab;
