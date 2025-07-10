
import { useState } from "react";
import { Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePermissionCheck } from "@/hooks/auth";
import { VerificationRequiredModal } from "@/components/auth/VerificationRequiredModal";
import { Offer } from "@/types";

interface OfferFormProps {
  listingId: string;
  listingTitle: string;
  currentPrice: number;
  onMakeOffer: (amount: number, message?: string) => Promise<{ success: boolean }>;
  userOfferStatus: {
    hasPendingOffer: boolean;
    latestOffer: Offer | null;
  };
}

export const OfferForm = ({ 
  listingId, 
  listingTitle,
  currentPrice, 
  onMakeOffer,
  userOfferStatus
}: OfferFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const { canMakeOffers, verificationLevel, getVerificationMessage } = usePermissionCheck();
  
  // Calculate suggested offer (10% less than asking price)
  const suggestedOffer = Math.floor(currentPrice * 0.9);

  // Create form schema
  const FormSchema = z.object({
    amount: z.coerce
      .number()
      .positive("Offer must be a positive number")
      .min(1, "Offer must be at least £1"),
    message: z.string().optional()
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      amount: suggestedOffer,
      message: ""
    },
  });

  const handleSubmit = async (values: z.infer<typeof FormSchema>) => {
    if (!canMakeOffers) {
      setShowVerificationModal(true);
      return;
    }

    setIsSubmitting(true);
    const result = await onMakeOffer(values.amount, values.message);
    setIsSubmitting(false);
    
    if (result.success) {
      // Reset form
      form.reset();
    }
  };

  // Display previous offer if there is one
  if (userOfferStatus.hasPendingOffer && userOfferStatus.latestOffer) {
    const offer = userOfferStatus.latestOffer;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Your Pending Offer</CardTitle>
          <CardDescription>
            You already have a pending offer on this listing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Offer Amount</h4>
              <p className="text-xl font-bold">£{offer.amount.toLocaleString()}</p>
            </div>
            
            {offer.message && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Your Message</h4>
                  <p className="mt-1">{offer.message}</p>
                </div>
              </>
            )}
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
              <div className="mt-1 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-md text-sm inline-block">
                Awaiting seller response
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start text-xs text-muted-foreground space-y-1">
          <p>• The seller will be notified of your offer</p>
          <p>• You'll be notified when they respond</p>
          <p>• You can only have one active offer per listing</p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Make an Offer</CardTitle>
        <CardDescription>
          Current price: <span className="font-semibold">£{currentPrice.toLocaleString()}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!canMakeOffers && (
          <Alert className="mb-4">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              {getVerificationMessage("make offers")}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Offer (£)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="1"
                      min={1}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Suggest an amount you'd be willing to pay
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add a message to the seller"
                      className="min-h-[80px]"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Explain why you're making this offer
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || !canMakeOffers}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Offer...
                </>
              ) : (
                canMakeOffers ? "Submit Offer" : "Verification Required"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-start text-xs text-muted-foreground">
        <p className="mb-1">• Submitting an offer doesn't guarantee acceptance</p>
        <p className="mb-1">• The seller can accept, decline, or counter your offer</p>
        <p>• You'll be notified when the seller responds</p>
      </CardFooter>

      <VerificationRequiredModal
        open={showVerificationModal}
        onOpenChange={setShowVerificationModal}
        action="make offers"
        currentLevel={verificationLevel}
        requiredLevel="verified"
      />
    </Card>
  );
};
