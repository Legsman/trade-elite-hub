
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface ListingCountdownProps {
  expiryDate: Date;
  className?: string;
  isAuction?: boolean;
}

export const ListingCountdown = ({ 
  expiryDate, 
  className = "", 
  isAuction = false 
}: ListingCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = expiryDate.getTime() - now.getTime();
      
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

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Set up interval
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Clean up
    return () => clearInterval(timer);
  }, [expiryDate]);

  // Format function for 2-digit display
  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  // Function to determine display style based on time left
  const getDisplayStyle = () => {
    if (timeLeft.expired) {
      return "text-destructive";
    }
    
    // Less than 1 hour remaining
    if (timeLeft.days === 0 && timeLeft.hours === 0) {
      return "text-destructive font-bold animate-pulse";
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
    
    return isAuction ? "Time remaining" : "Time remaining";
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
};
