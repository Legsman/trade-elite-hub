import { AlertTriangle, Shield, MessageCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUserVerification } from "@/hooks/auth/useUserVerification";
import { useAuth } from "@/hooks/auth/useAuth";
import { VerificationRequestModal } from "./VerificationRequestModal";
import { VerificationInfoPage } from "./VerificationInfoPage";
import { useState } from "react";

export function VerificationBanner() {
  const { user } = useAuth();
  const { level, loading } = useUserVerification();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Don't show banner if user is not logged in, still loading, or already verified
  if (!user || loading || level !== "unverified") {
    return null;
  }

  return (
    <>
      <Alert className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">
              Account Verification Required
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Your account is unverified. You can browse listings but cannot send messages, place bids, make offers, or create listings until verified.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowRequestModal(true)}
              className="border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/50"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Admin
            </Button>
            <Button 
              size="sm"
              onClick={() => setShowInfoModal(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-600 dark:hover:bg-amber-700"
            >
              <Shield className="h-4 w-4 mr-2" />
              Learn About Verification
            </Button>
          </div>
        </AlertDescription>
      </Alert>
      
      <VerificationRequestModal 
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      />
      
      <Dialog open={showInfoModal} onOpenChange={setShowInfoModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Account Verification Information</DialogTitle>
          </DialogHeader>
          <VerificationInfoPage 
            onClose={() => setShowInfoModal(false)}
            onRequestVerification={() => {
              setShowInfoModal(false);
              setShowRequestModal(true);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}