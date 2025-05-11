
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";

interface ImageEnlargeModalProps {
  images: string[];
  initialIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
}

export const ImageEnlargeModal = ({
  images,
  initialIndex,
  open,
  onOpenChange,
  title,
}: ImageEnlargeModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Reset zoom when changing images
  const handleImageChange = (newIndex: number) => {
    setZoomLevel(1);
    setCurrentIndex(newIndex);
  };

  const handlePrevious = () => {
    handleImageChange(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const handleNext = () => {
    handleImageChange(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 1));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh] p-0 overflow-hidden">
        <div className="relative h-full">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-50"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Image container */}
          <div 
            className="relative flex items-center justify-center h-[80vh] overflow-hidden bg-black"
            style={{ cursor: zoomLevel > 1 ? "move" : "default" }}
          >
            <img
              src={images[currentIndex]}
              alt={`${title} - Image ${currentIndex + 1}`}
              className="max-h-full transition-transform duration-200"
              style={{ 
                transform: `scale(${zoomLevel})`,
                maxWidth: "100%",
                objectFit: "contain"
              }}
            />
          </div>

          {/* Controls */}
          <div className="bg-background p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground ml-2">
                {Math.round(zoomLevel * 100)}%
              </span>
            </div>

            <div className="text-sm">
              {currentIndex + 1} / {images.length}
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handlePrevious}
                disabled={images.length <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleNext}
                disabled={images.length <= 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
