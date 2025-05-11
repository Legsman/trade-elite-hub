
import { Separator } from "@/components/ui/separator";
import { UseFormReturn } from "react-hook-form";
import { BasicDetailsFields, PricingFields, AdditionalDetailsFields } from "./form";

interface ListingDetailsFormProps {
  form: UseFormReturn<any>;
}

export const ListingDetailsForm = ({ form }: ListingDetailsFormProps) => {
  return (
    <>
      <BasicDetailsFields form={form} />
      
      <Separator />
      
      <PricingFields form={form} />
      
      <AdditionalDetailsFields form={form} />
    </>
  );
};
