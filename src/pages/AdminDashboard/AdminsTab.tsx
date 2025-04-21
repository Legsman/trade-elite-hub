
import React from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AdminsTabProps {
  users: any[];
  promoteAdmin: (userId: string) => void;
  demoteAdmin: (userId: string) => void;
  currentUserId: string;
}

const AdminsTab: React.FC<AdminsTabProps> = ({ users, promoteAdmin, demoteAdmin, currentUserId }) => (
  <div className="space-y-4">
    <h2 className="text-2xl font-semibold">Admin User Management</h2>
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
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.full_name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.role === "admin" ? "default" : "outline"}>{user.role}</Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    user.status === "active"
                      ? "outline"
                      : user.status === "warning"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell>
                {user.role !== "admin" ? (
                  <Button size="sm" onClick={() => promoteAdmin(user.id)}>
                    Make Admin
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => demoteAdmin(user.id)} disabled={user.id === currentUserId}>
                    Remove Admin
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    <p className="text-xs text-muted-foreground">
      You can't remove your own admin status.
    </p>
  </div>
);
export default AdminsTab;
