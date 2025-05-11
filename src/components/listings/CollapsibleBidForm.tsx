
import { useState } from "react";
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
import { formatCurrency } from "@/lib/utils";

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
  expiryDate
}: CollapsibleBidFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Calculate minimum bid - either highest bid + £5 or starting price
  const minimumBid = highestBid ? highestBid + 5 : currentPrice;

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

  const handleSubmit = async (values: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    try {
      console.log("Placing bid:", values.maximumBid);
      const result = await onPlaceBid(values.maximumBid);
      
      if (result.success) {
        // Reset form with updated minimum bid
        form.reset({
          maximumBid: values.maximumBid + 5
        });
        
        toast({
          title: "Bid Placed Successfully",
          description: `Your maximum bid of ${formatCurrency(values.maximumBid)} has been placed.`,
        });
        
        // Close the form after successful bid
        setIsOpen(false);
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

  // Check if auction has ended
  const isAuctionEnded = new Date() > expiryDate;
  
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

          {!isOpen && !isAuctionEnded && (
            <CollapsibleTrigger asChild>
              <Button>Place Bid</Button>
            </CollapsibleTrigger>
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
                        disabled={isSubmitting}
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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Placing Bid...
                    </>
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
