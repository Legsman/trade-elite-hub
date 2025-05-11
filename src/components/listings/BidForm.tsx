
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface BidFormProps {
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
}

export const BidForm = ({ 
  listingId, 
  currentPrice, 
  highestBid, 
  onPlaceBid,
  userBidStatus
}: BidFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Calculate minimum bid - either the highest bid + £5 or the starting price
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
    const result = await onPlaceBid(values.maximumBid);
    setIsSubmitting(false);
    
    if (result.success) {
      // Reset form with updated minimum bid
      form.reset({
        maximumBid: values.maximumBid + 5
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Place a Bid</CardTitle>
        <CardDescription>
          Current {highestBid ? "bid" : "starting price"}: <span className="font-semibold">£{(highestBid || currentPrice).toLocaleString()}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {userBidStatus.hasBid && (
          <div className="mb-4 p-3 bg-muted/50 rounded-md">
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
            
            <Button 
              type="submit" 
              className="w-full mt-4" 
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
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-start text-xs text-muted-foreground">
        <p className="mb-1">• All bids are binding and can't be withdrawn</p>
        <p className="mb-1">• Bids increase in £5 increments</p>
        <p className="mb-1">• Your bid will be automatically increased up to your maximum</p>
        <p>• The highest bid at auction end will win</p>
      </CardFooter>
    </Card>
  );
};
