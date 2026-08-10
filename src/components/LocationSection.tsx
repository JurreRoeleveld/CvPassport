import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import type { CvLocation } from '../data/locations'

export default function LocationSection({
  location,
}: {
  location: CvLocation
}) {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.35, 0.65, 1],
    [0, 1, 1, 0],
  )
  const y = useTransform(scrollYProgress, [0, 0.35], [40, 0])

  return (
    <section ref={sectionRef} className="location-section">
      <motion.article
        className="island-shell location-card"
        style={{ opacity, y }}
      >
        <p className="island-kicker">{location.period}</p>
        <h2 className="display-title location-title">{location.name}</h2>
        <p className="location-role">{location.role}</p>
        <p className="location-desc">{location.description}</p>
      </motion.article>
    </section>
  )
}
