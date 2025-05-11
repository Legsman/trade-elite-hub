
import { useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  images: File[];
  setImages: React.Dispatch<React.SetStateAction<File[]>>;
  imageUrls: string[];
  setImageUrls: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ImageUploader = ({
  images,
  setImages,
  imageUrls,
  setImageUrls,
}: ImageUploaderProps) => {
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    if (images.length + newFiles.length > 10) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 10 images per listing",
        variant: "destructive",
      });
      return;
    }

    // Create URLs for preview
    const newUrls = newFiles.map(file => URL.createObjectURL(file));
    
    setImages(prev => [...prev, ...newFiles]);
    setImageUrls(prev => [...prev, ...newUrls]);
  };

  const removeImage = (index: number) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(imageUrls[index]);
    
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
        {imageUrls.map((url, index) => (
          <div 
            key={index}
            className="relative aspect-square rounded-md overflow-hidden border"
          >
            <img 
              src={url} 
              alt={`Listing image ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              className="absolute top-2 right-2 bg-background/80 hover:bg-background p-1 rounded-full"
              onClick={() => removeImage(index)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </button>
          </div>
        ))}
        
        {images.length < 10 && (
          <div className="aspect-square flex items-center justify-center border border-dashed rounded-md">
            <label 
              htmlFor="image-upload" 
              className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ImagePlus className="h-8 w-8" />
              <span className="text-sm">Add Image</span>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>
        )}
      </div>
      
      <div className="text-sm text-muted-foreground">
        <p className="mb-2">
          <span className="font-medium">{images.length}/10</span> images uploaded
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Clear, well-lit photos from multiple angles perform best</li>
          <li>Include close-ups of any defects or wear</li>
          <li>Maximum file size: 5MB per image</li>
        </ul>
      </div>
    </>
  );
};
