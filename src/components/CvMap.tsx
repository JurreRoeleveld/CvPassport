import { useEffect, useRef, useState } from 'react'
import { useMotionValueEvent } from 'motion/react'
import type { MotionValue } from 'motion/react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import {
  Briefcase,
  GraduationCap,
  House,
  createElement as createLucideElement,
} from 'lucide'
import { HOME, INTRO, LOCATIONS } from '../data/locations'
import { cameraAt } from '../lib/camera'
import { useExploreMode } from '../lib/explore-mode'
import type { CvLocation } from '../data/locations'

// Free, no account or API key required: https://openfreemap.org
const MAP_STYLES = {
  light: 'https://tiles.openfreemap.org/styles/liberty',
  dark: 'https://tiles.openfreemap.org/styles/dark',
}

const MARKER_ICONS = {
  education: GraduationCap,
  work: Briefcase,
  home: House,
} as const

const NO_PADDING = { top: 0, bottom: 0, left: 0, right: 0 }

// Below this zoom the visitor has left the Netherlands far behind and is
// drifting toward space; show the notice that the journey ends here.
const SPACE_ZOOM = 3

// The cards overlap the viewport: a bottom sheet on small screens, a left
// column from 640px up (matching story.css). Pad the covered side so the
// camera's focal point sits in the visible part instead of behind a card.
function cardPadding(map: MapLibreMap) {
  const container = map.getContainer()
  if (window.matchMedia('(min-width: 640px)').matches) {
    return { ...NO_PADDING, left: Math.round(container.clientWidth * 0.35) }
  }
  return { ...NO_PADDING, bottom: Math.round(container.clientHeight * 0.5) }
}

function interactionHandlers(map: MapLibreMap) {
  return [
    map.dragPan,
    map.scrollZoom,
    map.doubleClickZoom,
    map.touchZoomRotate,
    map.keyboard,
  ]
}

function markerElement(location: CvLocation): HTMLElement {
  const element = document.createElement('div')
  element.className = `map-marker map-marker--${location.kind}`
  element.setAttribute('role', 'button')
  element.setAttribute('aria-label', location.name)
  element.appendChild(createLucideElement(MARKER_ICONS[location.kind]))
  return element
}

function prefersDarkMap() {
  return document.documentElement.classList.contains('dark')
}

export default function CvMap({
  progress,
  explore,
  onSelect,
}: {
  progress: MotionValue<number>
  explore: boolean
  onSelect: (location: CvLocation) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const exploreRef = useRef(explore)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect
  const { requestNudge } = useExploreMode()
  const requestNudgeRef = useRef(requestNudge)
  requestNudgeRef.current = requestNudge
  const [spaceNotice, setSpaceNotice] = useState(false)

  // MapLibre GL touches `window` on import, so it is loaded lazily on the
  // client only — never during SSR.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let cancelled = false
    let map: MapLibreMap | undefined
    let themeObserver: MutationObserver | undefined

    import('maplibre-gl').then((module) => {
      // Vite's CJS interop does not always provide a default export here.
      const maplibregl = module.default ?? module
      if (cancelled || !containerRef.current) return

      map = new maplibregl.Map({
        container: containerRef.current,
        style: prefersDarkMap() ? MAP_STYLES.dark : MAP_STYLES.light,
        ...cameraAt(progress.get()),
        interactive: false,
        attributionControl: { compact: true },
      })
      const activeMap = map

      for (const location of [HOME, ...LOCATIONS]) {
        const element = markerElement(location)
        element.addEventListener('click', () => {
          if (!exploreRef.current) return
          onSelectRef.current(location)
          activeMap.easeTo({
            center: location.coordinates,
            zoom: location.zoom,
            padding: cardPadding(activeMap),
            duration: 700,
          })
        })
        new maplibregl.Marker({ element, anchor: 'center' })
          .setLngLat(location.coordinates)
          .addTo(activeMap)
      }

      activeMap.on('zoom', () => {
        setSpaceNotice(exploreRef.current && activeMap.getZoom() < SPACE_ZOOM)
      })

      if (exploreRef.current) {
        for (const handler of interactionHandlers(activeMap)) handler.enable()
      } else {
        activeMap.jumpTo({
          ...cameraAt(progress.get()),
          padding: cardPadding(activeMap),
        })
      }

      // Follow the site theme: swap the map style when the ThemeToggle
      // changes the root element's class.
      let dark = prefersDarkMap()
      themeObserver = new MutationObserver(() => {
        if (prefersDarkMap() === dark) return
        dark = !dark
        activeMap.setStyle(dark ? MAP_STYLES.dark : MAP_STYLES.light)
      })
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      })

      mapRef.current = activeMap
    })

    // In story mode the map is not interactive; when a visitor tries to drag
    // or pinch it anyway, nudge the explore toggle to show the way.
    let pointerDownAt: { x: number; y: number } | null = null
    let lastNudge = 0

    const maybeNudge = () => {
      if (exploreRef.current) return
      const now = Date.now()
      if (now - lastNudge < 1500) return
      lastNudge = now
      requestNudgeRef.current()
    }
    const onPointerDown = (event: PointerEvent) => {
      pointerDownAt = { x: event.clientX, y: event.clientY }
    }
    const onPointerMove = (event: PointerEvent) => {
      if (!pointerDownAt) return
      const distance = Math.hypot(
        event.clientX - pointerDownAt.x,
        event.clientY - pointerDownAt.y,
      )
      if (distance > 10) {
        pointerDownAt = null
        maybeNudge()
      }
    }
    const onPointerUp = () => {
      pointerDownAt = null
    }
    const onWheel = (event: WheelEvent) => {
      // ctrlKey is set for trackpad pinch gestures.
      if (event.ctrlKey) maybeNudge()
    }
    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length >= 2) maybeNudge()
    }

    container.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    container.addEventListener('wheel', onWheel, { passive: true })
    container.addEventListener('touchmove', onTouchMove, { passive: true })

    return () => {
      cancelled = true
      themeObserver?.disconnect()
      container.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      container.removeEventListener('wheel', onWheel)
      container.removeEventListener('touchmove', onTouchMove)
      map?.remove()
      mapRef.current = null
    }
  }, [progress])

  useEffect(() => {
    exploreRef.current = explore
    // Markers are only clickable in explore mode; reflect that in the cursor.
    containerRef.current?.classList.toggle('cv-map--explore', explore)
    const map = mapRef.current
    if (!map) return

    if (explore) {
      // Stay on the current location; the visitor takes over from here.
      for (const handler of interactionHandlers(map)) handler.enable()
      map.easeTo({ padding: NO_PADDING, duration: 500 })
    } else {
      setSpaceNotice(false)
      for (const handler of interactionHandlers(map)) handler.disable()
      map.jumpTo({ ...cameraAt(progress.get()), padding: cardPadding(map) })
    }
  }, [explore, progress])

  useMotionValueEvent(progress, 'change', (value) => {
    const map = mapRef.current
    if (exploreRef.current || !map) return
    map.jumpTo({ ...cameraAt(value), padding: cardPadding(map) })
  })

  const returnToNetherlands = () => {
    setSpaceNotice(false)
    mapRef.current?.easeTo({
      center: INTRO.coordinates,
      zoom: INTRO.zoom,
      duration: 2500,
    })
  }

  return (
    <>
      <div ref={containerRef} className="cv-map" />
      {spaceNotice && (
        <div className="space-notice island-shell rise-in" role="status">
          <p>
            Unfortunately, I did not yet have the opportunity to go to space.
          </p>
          <button type="button" onClick={returnToNetherlands}>
            Go back to the Netherlands
          </button>
        </div>
      )}
    </>
  )
}
