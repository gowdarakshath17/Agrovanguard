import React, { useEffect, useState } from 'react';
import { Database, WifiOff } from 'lucide-react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

interface OfflineIndicatorProps {
  onOpenAdvisories?: () => void;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ onOpenAdvisories }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-wrap items-center gap-2.5 rounded-2xl bg-amber-600 px-4 py-2.5 text-xs font-medium text-white shadow-xl border border-amber-400/40 backdrop-blur-md animate-in slide-in-from-bottom-2">
      <div className="flex items-center gap-2">
        <WifiOff className="h-4 w-4 text-white animate-pulse" />
        <span><strong>Offline Mode:</strong> Cached data & tools available.</span>
      </div>
      {onOpenAdvisories && (
        <button
          onClick={onOpenAdvisories}
          className="ml-auto flex items-center bg-white/20 hover:bg-white/30 text-white font-bold px-2.5 py-1 rounded-xl text-[11px] transition-colors border border-white/30"
        >
          <Database className="h-3 w-3 mr-1" />
          View Stored Advisories
        </button>
      )}
    </div>
  );
};
