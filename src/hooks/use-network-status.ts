import { useState, useEffect } from 'react';
import { logInfo } from '@/lib/errorLogger';

interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean; // Track if we were offline (for reconnection detection)
}

/**
 * Hook to monitor network status
 * 
 * Checks:
 * - window.navigator.onLine
 * - online/offline events
 * - Auto-checks every 1 second when offline
 * 
 * @returns { isOnline, wasOffline } - Current and previous network status
 */
export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Update online status
    const handleOnline = () => {
      logInfo('Network status: online');
      setWasOffline(!isOnline); // Mark that we were offline if we're now online
      setIsOnline(true);
    };

    // Update offline status
    const handleOffline = () => {
      logInfo('Network status: offline');
      setIsOnline(false);
    };

    // Listen to browser events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Auto-check every 1 second when offline
    let intervalId: NodeJS.Timeout | null = null;

    if (!isOnline) {
      intervalId = setInterval(() => {
        const currentStatus = navigator.onLine;
        if (currentStatus !== isOnline) {
          setIsOnline(currentStatus);
          if (currentStatus) {
            setWasOffline(true);
            logInfo('Network reconnected via polling');
          }
        }
      }, 1000);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isOnline]);

  // Reset wasOffline flag after a short delay
  useEffect(() => {
    if (wasOffline) {
      const timeout = setTimeout(() => {
        setWasOffline(false);
      }, 3000); // Reset after 3 seconds

      return () => clearTimeout(timeout);
    }
  }, [wasOffline]);

  return { isOnline, wasOffline };
}
