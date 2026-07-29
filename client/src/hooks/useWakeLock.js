import { useEffect, useRef, useState } from 'react';

/**
 * Screen Wake Lock hook to prevent smartphones/tablets from going into standby
 * during active poker gameplay. Automatically re-acquires Wake Lock on visibilitychange.
 */
export function useWakeLock(enabled = true) {
  const wakeLockRef = useRef(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !('wakeLock' in navigator)) {
      return;
    }

    let isMounted = true;

    const requestWakeLock = async () => {
      try {
        if (wakeLockRef.current && !wakeLockRef.current.released) {
          return;
        }
        const lock = await navigator.wakeLock.request('screen');
        wakeLockRef.current = lock;
        if (isMounted) setIsActive(true);

        lock.addEventListener('release', () => {
          if (isMounted) setIsActive(false);
        });
      } catch (err) {
        console.warn('Screen Wake Lock request failed:', err.message);
        if (isMounted) setIsActive(false);
      }
    };

    // Request wake lock initially
    requestWakeLock();

    // Re-acquire wake lock when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [enabled]);

  return { isActive, isSupported: typeof navigator !== 'undefined' && 'wakeLock' in navigator };
}
