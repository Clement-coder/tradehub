'use client';

import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export function OfflineDetector() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Animated WiFi Off Icon */}
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center border-4 border-red-500/30">
            <WifiOff className="w-12 h-12 text-red-500 animate-pulse" />
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold mb-2">No Internet Connection</h2>
        <p className="text-muted-foreground mb-6">
          Please check your internet connection and try again.
        </p>

        {/* Retry Button */}
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>

        {/* Connection Tips */}
        <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border text-left">
          <p className="text-sm font-semibold mb-2">Troubleshooting Tips:</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Check your WiFi or mobile data connection</li>
            <li>• Try turning airplane mode off</li>
            <li>• Restart your router if using WiFi</li>
            <li>• Contact your internet service provider</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
