import { HOME, INTRO, LOCATIONS } from '../data/locations'

export type CameraPosition = {
  center: [number, number]
  zoom: number
}

// The story opens over the whole country behind the intro; home and each
// following stop match a section in scroll order.
const STOPS: Array<CameraPosition> = [INTRO, HOME, ...LOCATIONS].map(
  (location) => ({
    center: location.coordinates,
    zoom: location.zoom,
  }),
)

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * Maps overall scroll progress (0–1) to a camera position along the stops,
 * easing within each segment and dipping the zoom mid-flight so moving
 * between locations reads as a fly-over.
 */
export function cameraAt(progress: number): CameraPosition {
  const segments = STOPS.length - 1
  const clamped = Math.min(Math.max(progress, 0), 1)
  const position = clamped * segments
  const index = Math.min(Math.floor(position), segments - 1)
  const from = STOPS[index]
  const to = STOPS[index + 1]
  const t = easeInOutCubic(position - index)

  const lng = from.center[0] + (to.center[0] - from.center[0]) * t
  const lat = from.center[1] + (to.center[1] - from.center[1]) * t
  const zoomDip = Math.sin(t * Math.PI) * 1.75
  const zoom = from.zoom + (to.zoom - from.zoom) * t - zoomDip

  return { center: [lng, lat], zoom }
}
