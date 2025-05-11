
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ListingImageUploader } from "@/components/listings/ListingImageUploader";

interface CreateListingImagesSectionProps {
  images: File[];
  setImages: React.Dispatch<React.SetStateAction<File[]>>;
  imageUrls: string[];
  setImageUrls: React.Dispatch<React.SetStateAction<string[]>>;
}

export const CreateListingImagesSection = ({
  images,
  setImages,
  imageUrls,
  setImageUrls,
}: CreateListingImagesSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Images</CardTitle>
        <CardDescription>
          Add up to 10 high-quality images of your item
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ListingImageUploader 
          images={images}
          setImages={setImages}
          imageUrls={imageUrls}
          setImageUrls={setImageUrls}
        />
      </CardContent>
    </Card>
  );
};
