
import React from "react";
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
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAdminDashboardContext } from "../context/AdminDashboardContext";

const ReportsTab: React.FC = () => {
  const navigate = useNavigate();
  const {
    reports: reportedItems,
    formatDate,
    handleApproveItem,
    handleRejectItem,
  } = useAdminDashboardContext();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Reported By</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reportedItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6">
                No reported items
              </TableCell>
            </TableRow>
          ) : (
            reportedItems.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="capitalize">{report.type}</TableCell>
                <TableCell>{report.item_title}</TableCell>
                <TableCell>{report.reason}</TableCell>
                <TableCell>{report.reporter_name}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      report.status === 'resolved'
                        ? 'default'
                        : report.status === 'investigating'
                        ? 'secondary'
                        : report.status === 'dismissed'
                        ? 'outline'
                        : 'destructive'
                    }
                  >
                    {report.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(report.created_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (report.type === 'listing') {
                          navigate(`/listings/${report.item_id}`);
                        } else if (report.type === 'user') {
                          toast({
                            title: "View user profile",
                            description: "This would navigate to the user profile in a real app",
                          });
                        } else {
                          toast({
                            title: "View message",
                            description: "This would navigate to the message in a real app",
                          });
                        }
                      }}
                    >
                      View
                    </Button>
                    {report.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApproveItem(report.id, 'report')}
                        >
                          Take Action
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectItem(report.id, 'report')}
                        >
                          Dismiss
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReportsTab;
