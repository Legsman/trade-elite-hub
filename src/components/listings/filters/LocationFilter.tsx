
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface LocationFilterProps {
  location: string;
  onLocationChange: (value: string) => void;
}

export const LocationFilter: React.FC<LocationFilterProps> = ({
  location,
  onLocationChange,
}) => {
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch locations from database
  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("listings")
          .select("location")
          .eq("status", "active")
          .order("location");

        if (error) {
          throw error;
        }

        // Extract unique locations
        const uniqueLocations = Array.from(
          new Set(data.map((item) => item.location))
        );
        setLocations(uniqueLocations);
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  return (
    <Select value={location} onValueChange={onLocationChange}>
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder="Location" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all_locations">All Locations</SelectItem>
        {locations.map((loc) => (
          <SelectItem key={loc} value={loc}>
            {loc}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
