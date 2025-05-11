
import { useState, useEffect, useRef, memo } from "react";
import { Clock } from "lucide-react";

interface ListingCountdownProps {
  expiryDate: Date;
  className?: string;
  isAuction?: boolean;
  listingStatus?: string; // Add status prop
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

// Shared timer manager to reduce timer instances
const useCountdownManager = () => {
  const [time, setTime] = useState(Date.now());
  const frameRef = useRef<number | null>(null);
  
  useEffect(() => {
    const updateTime = () => {
      setTime(Date.now());
      frameRef.current = requestAnimationFrame(updateTime);
    };
    
    frameRef.current = requestAnimationFrame(updateTime);
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);
  
  return time;
};

export const ListingCountdown = memo(({ 
  expiryDate, 
  className = "", 
  isAuction = false,
  listingStatus = "active" // Default to active
}: ListingCountdownProps) => {
  // If listing is sold, show special sold message instead of countdown
  if (listingStatus === "sold") {
    return (
      <div className={`flex items-center ${className}`}>
        <Clock className="h-4 w-4 mr-1 flex-shrink-0 text-green-600" />
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">
            Listing status
          </span>
          <div className="font-medium text-sm text-green-600">
            <span>Sold</span>
          </div>
        </div>
      </div>
    );
  }

  const currentTime = useCountdownManager();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false
  });

  const lastCalculationRef = useRef<number>(0);
  const expiryTimeMs = useRef<number>(expiryDate.getTime());
  
  // Recalculate time every second instead of on every render
  useEffect(() => {
    // Only update if at least 1000ms have passed
    if (currentTime - lastCalculationRef.current < 950) {
      return;
    }
    
    const calculateTimeLeft = (): TimeLeft => {
      const difference = expiryTimeMs.current - currentTime;
      
      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          expired: true
        };
      }
      
      // Calculate time components
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      return {
        days,
        hours,
        minutes,
        seconds,
        expired: false
      };
    };

    lastCalculationRef.current = currentTime;
    setTimeLeft(calculateTimeLeft());
  }, [currentTime]);

  // Format function for 2-digit display
  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  // Function to determine display style based on time left
  const getDisplayStyle = () => {
    if (timeLeft.expired) {
      return "text-destructive";
    }
    
    // Less than 1 hour remaining
    if (timeLeft.days === 0 && timeLeft.hours === 0) {
      return "text-destructive font-bold";
    }
    
    // Less than 6 hours remaining
    if (timeLeft.days === 0 && timeLeft.hours < 6) {
      return "text-orange-500 font-bold";
    }
    
    // Less than 1 day remaining
    if (timeLeft.days === 0) {
      return "text-amber-600";
    }

    return "";
  };

  // Get label text
  const getLabel = () => {
    if (timeLeft.expired) {
      return isAuction ? "Auction ended" : "Listing expired";
    }
    
    if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes < 5) {
      return isAuction ? "Ending now!" : "Expiring now!";
    }
    
    if (timeLeft.days === 0 && timeLeft.hours === 0) {
      return "Less than 1 hour left";
    }
    
    return "Time remaining";
  };

  return (
    <div className={`flex items-center ${className}`}>
      <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
      <div className="flex flex-col">
        <span className="text-sm text-muted-foreground">
          {getLabel()}
        </span>
        <div className={`font-mono text-sm ${getDisplayStyle()}`}>
          {timeLeft.expired ? (
            <span>Ended</span>
          ) : (
            <>
              {timeLeft.days > 0 && <span>{timeLeft.days}d </span>}
              <span>{formatNumber(timeLeft.hours)}h </span>
              <span>{formatNumber(timeLeft.minutes)}m </span>
              <span>{formatNumber(timeLeft.seconds)}s</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

ListingCountdown.displayName = "ListingCountdown";
