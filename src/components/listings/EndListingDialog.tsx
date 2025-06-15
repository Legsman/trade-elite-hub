
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const reasonOptions = [
  { value: "item_sold_elsewhere", label: "Item sold outside the platform" },
  { value: "no_longer_available", label: "Item no longer available" },
  { value: "made_a_mistake", label: "Mistake in listing or price" },
  { value: "other", label: "Other (please specify)" },
];

const formSchema = z.object({
  reason: z.string().min(1, "Select a reason for ending listing"),
  additionalInfo: z.string().max(400, "Max 400 characters").optional(),
});

type EndListingFormValues = z.infer<typeof formSchema>;

interface EndListingDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onEnd: (data: EndListingFormValues) => Promise<boolean>;
  listingTitle: string;
  isEnding: boolean;
}

export function EndListingDialog({
  open,
  onOpenChange,
  onEnd,
  listingTitle,
  isEnding,
}: EndListingDialogProps) {
  const form = useForm<EndListingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
      additionalInfo: "",
    },
  });

  const [submitting, setSubmitting] = useState(false);

  const selectedReason = form.watch("reason");

  const handleSubmit = async (values: EndListingFormValues) => {
    setSubmitting(true);
    try {
      const ok = await onEnd(values);
      if (ok) {
        form.reset();
        onOpenChange(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>End Listing Early</DialogTitle>
          <DialogDescription>
            Why are you ending &quot;{listingTitle}&quot;? Buyers will be notified it&apos;s ended.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-1">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      disabled={isEnding || submitting}
                      className="w-full border rounded-md px-3 py-2"
                    >
                      <option value="">Select reason</option>
                      {reasonOptions.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormDescription>
                    This reason is for internal use and maintaining trust on the platform.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedReason === "other" && (
              <FormField
                control={form.control}
                name="additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Information</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        placeholder="Describe why you're ending this listing"
                        disabled={isEnding || submitting}
                      />
                    </FormControl>
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
                disabled={isEnding || submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isEnding || submitting}
              >
                {isEnding || submitting ? "Ending..." : "End Listing"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
