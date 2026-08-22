import * as React from "react"

// Reveals an element once it scrolls into the viewport, then stops observing it.
export function useScrollReveal<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = React.useRef<T | null>(null)
  const [isInView, setIsInView] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return

    // Skip the observer entirely if IntersectionObserver isn't available (very old browsers)
    if (typeof IntersectionObserver === "undefined") {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true)
        observer.disconnect() // reveal only once, no re-trigger on scroll back up
      }
    }, { threshold: 0.15, ...options })

    observer.observe(el)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- options is intentionally excluded to avoid re-observing on every render
  }, [])

  return [ref, isInView] as const
}
