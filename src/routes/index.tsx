import { useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useScroll } from 'motion/react'
import CvMap from '../components/CvMap'
import LocationSection from '../components/LocationSection'
import { LOCATIONS } from '../data/locations'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const storyRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: storyRef,
    offset: ['start start', 'end end'],
  })

  return (
    <main>
      <div ref={storyRef} className="story">
        <div className="story-map">
          <CvMap progress={scrollYProgress} />
        </div>
        <div className="story-sections">
          <section className="story-intro">
            <div className="island-shell location-card rise-in">
              <p className="island-kicker">CV Passport</p>
              <h1 className="display-title story-title">A career, mapped.</h1>
              <p className="story-lede">
                Scroll to travel through the places that shaped my work.
              </p>
            </div>
          </section>
          {LOCATIONS.map((location) => (
            <LocationSection key={location.id} location={location} />
          ))}
        </div>
      </div>
    </main>
  )
}
