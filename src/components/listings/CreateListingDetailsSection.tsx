
import { UseFormReturn } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ListingDetailsForm } from "@/components/listings/ListingDetailsForm";

interface CreateListingDetailsSectionProps {
  form: UseFormReturn<any>;
}

export const CreateListingDetailsSection = ({ form }: CreateListingDetailsSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Listing Details</CardTitle>
        <CardDescription>
          Provide accurate information to help buyers find your listing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ListingDetailsForm form={form} />
      </CardContent>
    </Card>
  );
};
