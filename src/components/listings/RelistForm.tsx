
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const relistReasons = [
  { value: "buyer_no_payment", label: "Buyer did not complete payment" },
  { value: "buyer_requested_cancel", label: "Buyer requested to cancel the purchase" },
  { value: "shipping_issue", label: "Shipping issues or logistics problems" },
  { value: "item_damaged", label: "Item was damaged" },
  { value: "mutual_agreement", label: "Mutual agreement to cancel" },
  { value: "other", label: "Other (please specify)" }
];

const formSchema = z.object({
  reason: z.string({
    required_error: "Please select a reason for relisting",
  }),
  additionalInfo: z.string().max(500, {
    message: "Additional information cannot exceed 500 characters",
  }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RelistFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRelist: (data: FormValues) => Promise<boolean>;
  listingTitle: string;
}

export const RelistForm = ({ 
  open, 
  onOpenChange, 
  onRelist, 
  listingTitle 
}: RelistFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
      additionalInfo: "",
    },
  });
  
  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const result = await onRelist(values);
      if (result) {
        form.reset();
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const selectedReason = form.watch("reason");
  const isOtherReason = selectedReason === "other";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Relist Item</DialogTitle>
          <DialogDescription>
            Provide a reason why you need to relist "{listingTitle}".
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Relisting items affects marketplace integrity. Only relist items when a legitimate issue prevented the completion of the sale.
              </AlertDescription>
            </Alert>
            
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for relisting</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {relistReasons.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value}>
                          {reason.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Please select the most accurate reason for relisting this item.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {isOtherReason && (
              <FormField
                control={form.control}
                name="additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional information</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please provide details about why you need to relist this item..."
                        className="resize-none"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Please provide specific details about why you need to relist this item.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Relisting...
                  </>
                ) : (
                  "Relist Item"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
