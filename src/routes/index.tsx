import { useEffect, useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useScroll } from 'motion/react'
import CvMap from '../components/CvMap'
import LocationCard from '../components/LocationCard'
import LocationSection from '../components/LocationSection'
import StoryProgress from '../components/StoryProgress'
import { HOME, INTRO, LOCATIONS } from '../data/locations'
import { useExploreMode } from '../lib/explore-mode'
import { useSmoothSnap } from '../lib/use-smooth-snap'
import type { CvLocation } from '../data/locations'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const { explore } = useExploreMode()
  const [selected, setSelected] = useState<CvLocation | null>(null)
  useSmoothSnap(!explore)

  // Hiding the story sections collapses the page height, which clamps the
  // scroll position to 0 before any effect can sample it. Record the story
  // scroll position continuously instead, and restore it when returning from
  // explore mode so the story resumes where it left off.
  const savedScrollY = useRef(0)
  const wasExplore = useRef(false)
  useEffect(() => {
    if (explore) {
      wasExplore.current = true
      return
    }

    if (wasExplore.current) {
      wasExplore.current = false
      setSelected(null)
      window.scrollTo(0, savedScrollY.current)
    }

    const onScroll = () => {
      savedScrollY.current = window.scrollY
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [explore])

  // The explore card behaves like a modal: Escape closes it.
  useEffect(() => {
    if (!explore) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [explore])

  const storyRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: storyRef,
    offset: ['start start', 'end end'],
  })

  return (
    <main>
      <div ref={storyRef} className="story">
        <div className="story-map">
          <CvMap
            progress={scrollYProgress}
            explore={explore}
            onSelect={setSelected}
          />
        </div>
        <div className="story-sections" hidden={explore}>
          <section className="story-intro">
            <div className="island-shell location-card rise-in">
              <p className="island-kicker">{INTRO.name}</p>
              <h1 className="display-title story-title">{INTRO.title}</h1>
              <p className="story-lede">{INTRO.lede}</p>
            </div>
          </section>
          <LocationSection location={HOME} />
          {LOCATIONS.map((location) => (
            <LocationSection key={location.id} location={location} />
          ))}
        </div>
      </div>
      {!explore && <StoryProgress progress={scrollYProgress} />}
      {explore && selected && (
        <div className="explore-card">
          <article className="island-shell location-card rise-in">
            <button
              type="button"
              className="card-close"
              aria-label="Close"
              onClick={() => setSelected(null)}
            >
              ×
            </button>
            <LocationCard location={selected} />
          </article>
        </div>
      )}
    </main>
  )
}
