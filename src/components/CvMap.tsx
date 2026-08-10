import { useEffect, useRef } from 'react'
import { useMotionValueEvent } from 'motion/react'
import type { MotionValue } from 'motion/react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { LOCATIONS } from '../data/locations'
import { cameraAt } from '../lib/camera'

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty'

export default function CvMap({ progress }: { progress: MotionValue<number> }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)

  // MapLibre GL touches `window` on import, so it is loaded lazily on the
  // client only — never during SSR.
  useEffect(() => {
    if (!containerRef.current) return

    let cancelled = false
    let map: MapLibreMap | undefined

    import('maplibre-gl').then((module) => {
      // Vite's CJS interop does not always provide a default export here.
      const maplibregl = module.default ?? module
      if (cancelled || !containerRef.current) return

      map = new maplibregl.Map({
        container: containerRef.current,
        style: MAP_STYLE,
        ...cameraAt(progress.get()),
        interactive: false,
        attributionControl: { compact: true },
      })

      for (const location of LOCATIONS) {
        new maplibregl.Marker({ color: '#328f97' })
          .setLngLat(location.coordinates)
          .addTo(map)
      }

      mapRef.current = map
    })

    return () => {
      cancelled = true
      map?.remove()
      mapRef.current = null
    }
  }, [progress])

  useMotionValueEvent(progress, 'change', (value) => {
    mapRef.current?.jumpTo(cameraAt(value))
  })

  return <div ref={containerRef} className="cv-map" />
}
