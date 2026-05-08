import * as React from "react"

const MOBILE_BREAKPOINT = 768

function readIsMobile(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(readIsMobile)

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    const observer = new ResizeObserver(check)
    observer.observe(document.documentElement)
    return () => observer.disconnect()
  }, [])

  return isMobile
}
