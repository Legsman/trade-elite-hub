import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Shield, Star, Users, TrendingUp } from "lucide-react";
import { VerificationRequestForm } from "./VerificationRequestForm";
import { useVerificationRequests } from "@/hooks/auth/useVerificationRequests";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface VerificationRequestModalProps {
  children: React.ReactNode;
}

export function VerificationRequestModal({ children }: VerificationRequestModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { hasActiveRequest, latestRequest } = useVerificationRequests();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-orange-600" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {hasActiveRequest ? "Verification Status" : "Get Verified"}
          </DialogTitle>
          <DialogDescription>
            {hasActiveRequest 
              ? "Check your verification request status" 
              : "Unlock enhanced features and build trust with other users"
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {latestRequest && (
            <Alert>
              <div className="flex items-center gap-2">
                {getStatusIcon(latestRequest.status)}
                <AlertDescription>
                  {latestRequest.status === "pending" && 
                    "Your verification request is being reviewed. We'll notify you once it's processed."
                  }
                  {latestRequest.status === "approved" && 
                    `Your ${latestRequest.request_type} verification has been approved!`
                  }
                  {latestRequest.status === "rejected" && 
                    "Your verification request was rejected. You can submit a new request."
                  }
                </AlertDescription>
              </div>
            </Alert>
          )}

          {!hasActiveRequest && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      Verified User
                    </h3>
                    <Badge variant="secondary">Basic</Badge>
                  </div>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      Identity verification
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      Trust badge on profile
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      Priority customer support
                    </li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-600" />
                      Trader Status
                    </h3>
                    <Badge>Premium</Badge>
                  </div>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0" />
                      All verified user benefits
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0" />
                      Business verification
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0" />
                      Higher bidding limits
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0" />
                      Advanced trader tools
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Why Get Verified?
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Build Trust</div>
                      <div className="text-muted-foreground">Show others you're legitimate</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">More Sales</div>
                      <div className="text-muted-foreground">Verified users sell faster</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Premium Features</div>
                      <div className="text-muted-foreground">Access exclusive tools</div>
                    </div>
                  </div>
                </div>
              </div>

              <VerificationRequestForm onSuccess={() => setIsOpen(false)} />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}