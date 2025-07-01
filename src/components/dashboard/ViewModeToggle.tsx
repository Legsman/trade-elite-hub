import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ViewModeToggleProps {
  viewMode: "buying" | "selling";
  onViewModeChange: (mode: "buying" | "selling") => void;
}

export const ViewModeToggle = ({ viewMode, onViewModeChange }: ViewModeToggleProps) => {
  return (
    <div className="mb-6">
      <Tabs
        value={viewMode}
        onValueChange={(value) => onViewModeChange(value as "buying" | "selling")}
      >
        <TabsList className="w-full border-b rounded-none justify-start">
          <TabsTrigger value="buying">Buying</TabsTrigger>
          <TabsTrigger value="selling">Selling</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};