
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

interface CollapsibleBidFormProps {
  listingId: string;
  currentPrice: number;
  highestBid: number | null;
  onPlaceBid: (amount: number) => Promise<{ success: boolean }>;
  userBidStatus: {
    hasBid: boolean;
    isHighestBidder: boolean;
    userHighestBid: number | null;
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
  
  // Calculate minimum bid
  const minimumBid = highestBid ? highestBid + Math.max(1, Math.floor(highestBid * 0.05)) : currentPrice;

  // Create form schema
  const FormSchema = z.object({
    amount: z.coerce
      .number()
      .positive("Bid must be a positive number")
      .min(minimumBid, `Bid must be at least £${minimumBid.toLocaleString()}`)
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      amount: minimumBid
    },
  });

  const handleSubmit = async (values: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    const result = await onPlaceBid(values.amount);
    setIsSubmitting(false);
    
    if (result.success) {
      // Reset form with updated minimum bid
      form.reset({
        amount: values.amount + Math.max(1, Math.floor(values.amount * 0.05))
      });
      
      // Close the form after successful bid
      setIsOpen(false);
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
              <p className="text-green-600 font-medium">
                You are currently the highest bidder at £{userBidStatus.userHighestBid?.toLocaleString()}
              </p>
            ) : (
              <p className="text-amber-600">
                You have been outbid. Your highest bid was £{userBidStatus.userHighestBid?.toLocaleString()}
              </p>
            )}
          </div>
        )}

        <CollapsibleContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Bid (£)</FormLabel>
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
                      Minimum bid: £{minimumBid.toLocaleString()}
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
            <p>• You'll be notified by email if you're outbid</p>
            <p>• The highest bid at auction end will win</p>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
