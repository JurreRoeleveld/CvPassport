import { useState } from 'react'
import { motion, useMotionValueEvent } from 'motion/react'
import type { MotionValue } from 'motion/react'
import { Briefcase, GraduationCap, House, Map as MapIcon } from 'lucide-react'
import { HOME, INTRO, LOCATIONS } from '../data/locations'
import { suppressSnap } from '../lib/use-smooth-snap'
import type { CvLocation } from '../data/locations'

const STOP_ICONS = {
  intro: MapIcon,
  education: GraduationCap,
  work: Briefcase,
  home: House,
} as const

type ProgressStop = Pick<CvLocation, 'id' | 'name'> & {
  kind: keyof typeof STOP_ICONS
}

// Mirrors the camera stops: the intro's country-wide view, then home, then
// each CV location in scroll order.
const STOPS: Array<ProgressStop> = [
  { ...INTRO, kind: 'intro' },
  HOME,
  ...LOCATIONS,
]

function scrollToStop(index: number) {
  const sections = document.querySelectorAll('.story-intro, .location-section')
  if (index >= sections.length) return
  const section = sections[index]
  suppressSnap(1500)
  const rect = section.getBoundingClientRect()
  window.scrollTo({
    top: window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2,
    behavior: 'smooth',
  })
}

export default function StoryProgress({
  progress,
}: {
  progress: MotionValue<number>
}) {
  const [active, setActive] = useState(0)

  useMotionValueEvent(progress, 'change', (value) => {
    setActive(Math.round(value * (STOPS.length - 1)))
  })

  return (
    <nav className="story-progress" aria-label="Story progress">
      <div className="story-progress-track">
        <motion.div
          className="story-progress-fill"
          style={{ scaleX: progress }}
        />
      </div>
      {STOPS.map((location, index) => {
        const Icon = STOP_ICONS[location.kind]
        const active_ = index === active ? ' is-active' : ''
        return (
          <button
            key={location.id}
            type="button"
            aria-label={`Go to ${location.name}`}
            title={location.name}
            className={`progress-stop progress-stop--${location.kind}${active_}`}
            style={{ left: `${(index / (STOPS.length - 1)) * 100}%` }}
            onClick={() => scrollToStop(index)}
          >
            <Icon size={11} />
          </button>
        )
      })}
    </nav>
  )
}
