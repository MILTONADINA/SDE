import { useEffect, useState } from 'react'

import { WifiOff } from 'lucide-react'

/** Shows a warning banner when the browser goes offline */
export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const goOffline = () => setIsOffline(true)
    const goOnline = () => setIsOffline(false)

    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)

    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div
      className="bg-danger/90 text-white text-sm font-medium flex items-center justify-center gap-2 py-2 px-4"
      role="alert"
      aria-live="polite"
    >
      <WifiOff className="w-4 h-4" aria-hidden="true" />
      You are offline. Changes will not be saved.
    </div>
  )
}
