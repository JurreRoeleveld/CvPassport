import { useEffect, useState } from 'react'
import { BookOpen, Compass } from 'lucide-react'
import { useExploreMode } from '../lib/explore-mode'

export default function ExploreToggle() {
  const { explore, setExplore, nudge } = useExploreMode()
  const [nudging, setNudging] = useState(false)

  useEffect(() => {
    if (nudge === 0) return
    setNudging(true)
    const timer = setTimeout(() => setNudging(false), 1800)
    return () => clearTimeout(timer)
  }, [nudge])

  return (
    <button
      type="button"
      className={nudging ? 'mode-toggle is-nudging' : 'mode-toggle'}
      onClick={() => setExplore(!explore)}
    >
      {explore ? <BookOpen size={15} /> : <Compass size={15} />}
      {explore ? 'Back to story' : 'Explore map'}
    </button>
  )
}
