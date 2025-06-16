
import * as React from "react"

const MOBILE_BREAKPOINT = 768

// Function to detect mobile devices based on user agent
const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent;
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
  
  return mobileRegex.test(userAgent);
}

// Function to detect if running in a mobile app context (like Capacitor)
const isMobileApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check for Capacitor
  return !!(window as any).Capacitor;
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
  const [isActualMobile, setIsActualMobile] = React.useState<boolean>(false)
  const [isMobileAppContext, setIsMobileAppContext] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Screen size detection
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    // Device detection
    setIsActualMobile(isMobileDevice())
    setIsMobileAppContext(isMobileApp())

    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Return true if either screen size is mobile OR it's an actual mobile device OR running in mobile app
  const isMobileAny = !!isMobile || isActualMobile || isMobileAppContext

  return {
    isMobile: isMobileAny,
    isSmallScreen: !!isMobile,
    isActualMobile,
    isMobileApp: isMobileAppContext
  }
}

// Legacy export for backward compatibility
export function useIsMobileSimple() {
  const { isMobile } = useIsMobile()
  return isMobile
}
