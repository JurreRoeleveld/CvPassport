import { useEffect } from 'react'
import { animate } from 'motion/react'

const SNAP_SELECTOR = '.story-intro, .location-section'

let suppressedUntil = 0

/**
 * Temporarily disables snapping, e.g. while another animation (a progress bar
 * jump) drives the scroll position. Without this, a frame gap longer than the
 * settle delay lets the snap hijack the scroll mid-flight.
 */
export function suppressSnap(durationMs: number) {
  suppressedUntil = Date.now() + durationMs
}
// Snap only when the nearest section center is within this fraction of the
// viewport height, mirroring scroll-snap-type "proximity".
const PROXIMITY = 0.45
const SETTLE_DELAY_MS = 140

/**
 * Smoothly snaps the window scroll to the nearest story section after the
 * user stops scrolling. A JS reimplementation of CSS proximity scroll snap
 * with a controlled, gentler animation. Any user input cancels the glide.
 */
export function useSmoothSnap(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let timer: ReturnType<typeof setTimeout> | undefined
    let animation: { stop: () => void } | null = null
    let snapping = false

    const cancelSnap = () => {
      animation?.stop()
      animation = null
      snapping = false
    }

    const snapToNearest = () => {
      const sections = document.querySelectorAll(SNAP_SELECTOR)
      let target: number | null = null
      let bestDistance = Infinity

      for (const section of sections) {
        const rect = section.getBoundingClientRect()
        const delta = rect.top + rect.height / 2 - window.innerHeight / 2
        if (Math.abs(delta) < bestDistance) {
          bestDistance = Math.abs(delta)
          target = window.scrollY + delta
        }
      }

      if (target === null || bestDistance < 2) return
      if (bestDistance > window.innerHeight * PROXIMITY) return

      snapping = true
      animation = animate(window.scrollY, target, {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
        onUpdate: (value) => window.scrollTo(0, value),
        onComplete: () => {
          snapping = false
        },
      })
    }

    const onScroll = () => {
      if (snapping || Date.now() < suppressedUntil) return
      clearTimeout(timer)
      timer = setTimeout(snapToNearest, SETTLE_DELAY_MS)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('wheel', cancelSnap, { passive: true })
    window.addEventListener('touchstart', cancelSnap, { passive: true })
    window.addEventListener('keydown', cancelSnap)

    return () => {
      clearTimeout(timer)
      cancelSnap()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('wheel', cancelSnap)
      window.removeEventListener('touchstart', cancelSnap)
      window.removeEventListener('keydown', cancelSnap)
    }
  }, [enabled])
}
