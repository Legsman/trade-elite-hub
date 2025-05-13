
import { AlertCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useStartConversation } from "@/hooks/use-message";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAnalytics } from "@/hooks/use-analytics";
import { Listing } from "@/types";

interface ListingDetailsContactDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  listing: Listing;
  message: string;
  setMessage: (message: string) => void;
}

export const ListingDetailsContactDialog = ({
  open,
  setOpen,
  listing,
  message,
  setMessage
}: ListingDetailsContactDialogProps) => {
  const navigate = useNavigate();
  const { startConversation } = useStartConversation();
  const { trackEvent } = useAnalytics();
  const [sendingMessage, setSendingMessage] = useState(false);
  
  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message to send to the seller",
        variant: "destructive",
      });
      return;
    }
    
    setSendingMessage(true);
    
    const result = await startConversation(
      listing.sellerId,
      message,
      listing.id
    );
    
    setSendingMessage(false);
    
    if (result.success) {
      setOpen(false);
      setMessage("");
      
      toast({
        title: "Message sent",
        description: "Your message has been sent to the seller",
      });
      
      trackEvent("message_sent", { 
        listingId: listing.id,
        sellerId: listing.sellerId
      });
      
      // Redirect to messages
      navigate(`/messages`);
    }
  };

  const displayPrice = listing.type === "auction" ? listing.price : listing.price;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contact Seller</DialogTitle>
          <DialogDescription>
            Send a message to the seller about this listing.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-4">
            <div className="rounded-md border p-2 w-16 h-16 flex-shrink-0">
              <img 
                src={listing.images[0]} 
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="font-medium line-clamp-1">{listing.title}</h4>
              <p className="text-sm text-muted-foreground">£{displayPrice.toLocaleString()}</p>
            </div>
          </div>
          <Textarea
            placeholder="Write your message to the seller here..."
            className="min-h-[120px]"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="text-sm text-muted-foreground">
            <p className="flex items-start">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
              Do not share personal contact details in your first message.
            </p>
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            type="button"
            disabled={sendingMessage || !message.trim()}
            onClick={handleSendMessage}
          >
            {sendingMessage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Message"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
