
import { useState } from "react";
import { RelistForm } from "./RelistForm";
import { useRelistListing } from "@/hooks/listings/useRelistListing";
import { SoldItemsList } from "./sold-items/SoldItemsList";
import { useSoldItems } from "./sold-items/useSoldItems";

interface SoldItemsTabProps {
  userId: string;
}

export const SoldItemsTab = ({ userId }: SoldItemsTabProps) => {
  const [relistingItem, setRelistingItem] = useState<any>(null);
  const { relistListing, isRelisting } = useRelistListing(relistingItem?.id);
  const { soldItems, isLoading } = useSoldItems(userId, isRelisting);
  
  const handleRelistClick = (item) => {
    setRelistingItem(item);
  };
  
  const handleRelistSubmit = async (data) => {
    const success = await relistListing(data);
    if (success) {
      setRelistingItem(null);
    }
    return success;
  };
  
  return (
    <>
      <SoldItemsList 
        soldItems={soldItems} 
        isLoading={isLoading} 
        onRelistClick={handleRelistClick} 
      />
      
      {relistingItem && (
        <RelistForm
          open={!!relistingItem}
          onOpenChange={(open) => !open && setRelistingItem(null)}
          onRelist={handleRelistSubmit}
          listingTitle={relistingItem.title}
        />
      )}
    </>
  );
};

export default SoldItemsTab;
