
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
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Place a Bid</CardTitle>
        <CardDescription>
          Current {highestBid ? "highest bid" : "starting price"}: <span className="font-semibold">£{(highestBid || currentPrice).toLocaleString()}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {userBidStatus.hasBid && (
          <div className="mb-4 p-3 bg-muted/50 rounded-md">
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
        <p className="mb-1">• You'll be notified by email if you're outbid</p>
        <p>• The highest bid at auction end will win</p>
      </CardFooter>
    </Card>
  );
};
