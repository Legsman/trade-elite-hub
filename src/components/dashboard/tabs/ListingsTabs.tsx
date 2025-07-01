import { Button } from "@/components/ui/button";
import { TabType } from "@/hooks/dashboard/useUserListings";

interface ListingsTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TAB_OPTIONS: { value: TabType; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "ended", label: "Ended" },
  { value: "sold", label: "Sold" },
  { value: "all", label: "All" },
];

export const ListingsTabs = ({ activeTab, onTabChange }: ListingsTabsProps) => {
  return (
    <div className="flex gap-2 mb-4">
      {TAB_OPTIONS.map((tab) => (
        <Button
          key={tab.value}
          variant={tab.value === activeTab ? "default" : "outline"}
          size="sm"
          onClick={() => onTabChange(tab.value)}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
};