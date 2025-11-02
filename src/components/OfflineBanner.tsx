import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { commonToasts } from '@/lib/toast.utils';

/**
 * Offline banner that appears at the top of the screen
 * when network connection is lost
 */
export function OfflineBanner() {
  const { isOnline, wasOffline } = useNetworkStatus();

  // Show toasts on status change
  useEffect(() => {
    if (!isOnline) {
      commonToasts.offline();
    } else if (wasOffline) {
      commonToasts.reconnected();
    }
  }, [isOnline, wasOffline]);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground"
        >
          <div className="container flex items-center justify-center gap-2 py-2 text-sm font-medium">
            <WifiOff className="h-4 w-4" />
            <span>You're offline. Check your connection.</span>
          </div>
        </motion.div>
      )}
      {wasOffline && isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white"
        >
          <div className="container flex items-center justify-center gap-2 py-2 text-sm font-medium">
            <Wifi className="h-4 w-4" />
            <span>Back online</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
