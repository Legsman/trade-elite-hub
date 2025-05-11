
import { useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { useAnalytics } from "@/hooks/use-analytics";
import { Button } from "@/components/ui/button";
import { ImageEnlargeModal } from "./form/ImageEnlargeModal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ListingImageGalleryProps {
  images: string[];
  listingId: string;
  title: string;
}

export const ListingImageGallery = ({ 
  images, 
  listingId,
  title
}: ListingImageGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [enlargeModalOpen, setEnlargeModalOpen] = useState(false);
  const { trackEvent } = useAnalytics();

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
    trackEvent("listing_image_previous", { listingId });
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
    trackEvent("listing_image_next", { listingId });
  };

  const handleEnlargeImage = () => {
    setEnlargeModalOpen(true);
    trackEvent("listing_image_enlarge", { listingId });
  };

  return (
    <div className="relative rounded-lg overflow-hidden border">
      <div className="aspect-video relative">
        <img 
          src={images[currentImageIndex]} 
          alt={title}
          className="w-full h-full object-cover cursor-zoom-in"
          onClick={handleEnlargeImage}
        />
        
        {images.length > 1 && (
          <>
            <button 
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full"
              onClick={handlePrevImage}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full"
              onClick={handleNextImage}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Enlarge button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="absolute top-4 right-4 bg-background/80 hover:bg-background"
                size="icon"
                variant="ghost"
                onClick={handleEnlargeImage}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Enlarge image</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="absolute bottom-4 right-4 bg-background/80 rounded-full px-3 py-1 text-sm">
          {currentImageIndex + 1} / {images.length}
        </div>
      </div>
      
      {images.length > 1 && (
        <div className="p-2 flex gap-2 overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`flex-shrink-0 w-20 h-16 rounded overflow-hidden border-2 ${
                idx === currentImageIndex 
                  ? "border-purple" 
                  : "border-transparent"
              }`}
            >
              <img 
                src={img} 
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Enlarge Modal */}
      <ImageEnlargeModal 
        images={images}
        initialIndex={currentImageIndex}
        open={enlargeModalOpen}
        onOpenChange={setEnlargeModalOpen}
        title={title}
      />
    </div>
  );
};
