import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface CollapsibleBidFormProps {
  listingId: string;
  currentPrice: number;
  highestBid: number | null;
  onPlaceBid: (amount: number) => Promise<{ success: boolean }>;
  userBidStatus: {
    hasBid: boolean;
    isHighestBidder: boolean;
    userHighestBid: number | null;
    userMaximumBid: number | null;
  };
  expiryDate: Date;
}

export const CollapsibleBidForm = ({
  listingId,
  currentPrice,
  highestBid,
  onPlaceBid,
  userBidStatus,
  expiryDate,
}: CollapsibleBidFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [lastBidAmount, setLastBidAmount] = useState<number | null>(null);
  
  // Calculate minimum bid - either highest bid + £5 or starting price
  const minimumBid = highestBid ? highestBid + 5 : currentPrice;
  
  // Check if auction has expired
  const isExpired = new Date(expiryDate) <= new Date();

  // Create form schema
  const FormSchema = z.object({
    maximumBid: z.coerce
      .number()
      .positive("Bid must be a positive number")
      .min(minimumBid, `Bid must be at least £${minimumBid.toLocaleString()}`)
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      maximumBid: minimumBid
    },
  });

  // Reset form when minimum bid changes
  useEffect(() => {
    form.setValue('maximumBid', minimumBid);
  }, [minimumBid, form]);

  const handleSubmit = async (values: z.infer<typeof FormSchema>) => {
    // Check if auction has expired before placing bid
    if (isExpired) {
      toast({
        title: "Auction Ended",
        description: "This auction has ended. No more bids can be placed.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    setLastBidAmount(values.maximumBid);
    
    try {
      console.log("CollapsibleBidForm: Placing bid:", values.maximumBid);
      const result = await onPlaceBid(values.maximumBid);
      
      if (result.success) {
        console.log("CollapsibleBidForm: Bid successful");
        // Reset form with updated minimum bid
        form.reset({
          maximumBid: values.maximumBid + 5
        });
        
        // Close the form after successful bid
        setIsOpen(false);
      } else {
        console.log("CollapsibleBidForm: Bid failed");
      }
    } catch (error) {
      console.error("Error placing bid:", error);
      toast({
        title: "Bid Failed",
        description: "There was a problem placing your bid. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Note: isExpired is already defined above, no need for duplicate check
  
  // Add the proxy bidding info text
  const proxyBiddingInfo = (
    <div className="mt-4 p-3 bg-muted/30 rounded-md text-sm">
      <p className="mb-1 font-medium">How proxy bidding works:</p>
      <p>
        When you place a maximum bid, our system will automatically increase your bid 
        in £5 increments, but only as much as needed to outbid others. Your full 
        maximum bid amount is not shown to other bidders.
      </p>
    </div>
  );
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            {highestBid ? (
              <div className="flex items-baseline">
                <span className="text-sm text-muted-foreground mr-2">Current bid:</span>
                <span className="text-3xl font-bold text-purple">£{highestBid.toLocaleString()}</span>
              </div>
            ) : (
              <div className="flex items-baseline">
                <span className="text-sm text-muted-foreground mr-2">Starting bid:</span>
                <span className="text-3xl font-bold text-purple">£{currentPrice.toLocaleString()}</span>
              </div>
            )}
          </div>

          {!isOpen && !isExpired && (
            <CollapsibleTrigger asChild>
              <Button>Place Bid</Button>
            </CollapsibleTrigger>
          )}
          
          {isExpired && (
            <Badge variant="destructive">Auction Ended</Badge>
          )}
        </div>

        {userBidStatus.hasBid && (
          <div className="p-3 bg-muted/50 rounded-md">
            {userBidStatus.isHighestBidder ? (
              <div className="space-y-1">
                <p className="text-green-600 font-medium">
                  You are currently the highest bidder at £{userBidStatus.userHighestBid?.toLocaleString()}
                </p>
                <p className="text-xs">
                  Your maximum bid: £{userBidStatus.userMaximumBid?.toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-amber-600">
                  You have been outbid. Your highest bid was £{userBidStatus.userHighestBid?.toLocaleString()}
                </p>
                <p className="text-xs">
                  Your maximum bid: £{userBidStatus.userMaximumBid?.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}

        {lastBidAmount && !userBidStatus.hasBid && !isOpen && (
          <div className="p-3 bg-blue-50 rounded-md">
            <p className="text-blue-600">
              Your bid of £{lastBidAmount.toLocaleString()} is being processed...
            </p>
          </div>
        )}

        <CollapsibleContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <FormField
                control={form.control}
                name="maximumBid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Maximum Bid (£)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="1"
                        min={minimumBid}
                  disabled={isSubmitting || isExpired}
                />
                    </FormControl>
                    <FormDescription>
                      Minimum bid: £{minimumBid.toLocaleString()} (in £5 increments)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-2 mt-4">
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isSubmitting || isExpired}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Placing Bid...
                  </>
                ) : isExpired ? (
                  "Auction Ended"
                ) : (
                  "Place Bid"
                )}
              </Button>
                
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• All bids are binding and can't be withdrawn</p>
            <p>• Bids increase in £5 increments</p>
            <p>• Your bid will be automatically increased up to your maximum</p>
            <p>• The highest bid at auction end will win</p>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
