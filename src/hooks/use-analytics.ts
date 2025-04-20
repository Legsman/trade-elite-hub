
import { useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";

interface AnalyticsOptions {
  enabled?: boolean;
  pageViewEnabled?: boolean;
}

// Basic analytics hook that can be expanded
export const useAnalytics = (options: AnalyticsOptions = {}) => {
  const location = useLocation();
  const previousPath = useRef<string>(location.pathname);
  const { enabled = true, pageViewEnabled = true } = options;

  // Track page view
  useEffect(() => {
    if (!enabled || !pageViewEnabled) return;

    // Only track if path has changed
    if (previousPath.current !== location.pathname) {
      const pageTitle = document.title;
      trackPageView(location.pathname, pageTitle);
      previousPath.current = location.pathname;
    }
  }, [location, enabled, pageViewEnabled]);

  // Track page view
  const trackPageView = useCallback((path: string, title: string) => {
    if (!enabled) return;

    // Track with Google Analytics if available
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "page_view", {
        page_path: path,
        page_title: title,
      });
    }

    // Log to console for development
    console.log("Analytics: Page View", { path, title });
  }, [enabled]);

  // Track custom event
  const trackEvent = useCallback((eventName: string, eventParams?: Record<string, any>) => {
    if (!enabled) return;

    // Track with Google Analytics if available
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, eventParams);
    }

    // Log to console for development
    console.log("Analytics: Event", { eventName, eventParams });
  }, [enabled]);

  return {
    trackPageView,
    trackEvent,
  };
};

// Add this to global declarations to prevent TypeScript errors
declare global {
  interface Window {
    gtag?: (command: string, action: string, params?: any) => void;
  }
}
