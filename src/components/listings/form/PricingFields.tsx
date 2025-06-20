import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn, useWatch } from "react-hook-form";

interface PricingFieldsProps {
  form: UseFormReturn<any>;
}

export const PricingFields = ({ form }: PricingFieldsProps) => {
  // Watch type field (e.g., "auction" or "classified")
  const listingType = useWatch({
    control: form.control,
    name: "type",
    defaultValue: "classified",
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Price (£)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                {...field}
                onChange={event => field.onChange(parseFloat(event.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {listingType === "auction" && (
        <FormField
          control={form.control}
          name="reservePrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Reserve Price <span className="text-xs text-muted-foreground">(optional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="(No reserve)"
                  {...field}
                  onChange={event => {
                    const val = event.target.value ? parseFloat(event.target.value) : undefined;
                    field.onChange(isNaN(val as number) ? undefined : val);
                  }}
                />
              </FormControl>
              <FormDescription>
                Minimum price required for the item to be sold (auction only).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="allowBestOffer"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">
                Accept Best Offers
              </FormLabel>
              <FormDescription>
                Allow buyers to make offers below your asking price
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};
