import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

const ExploreModeContext = createContext<{
  explore: boolean
  setExplore: (value: boolean) => void
  /** Increments each time something suggests the user wants to explore. */
  nudge: number
  requestNudge: () => void
} | null>(null)

export function ExploreModeProvider({ children }: { children: ReactNode }) {
  const [explore, setExplore] = useState(false)
  const [nudge, setNudge] = useState(0)

  const value = useMemo(
    () => ({
      explore,
      setExplore,
      nudge,
      requestNudge: () => setNudge((count) => count + 1),
    }),
    [explore, nudge],
  )

  return (
    <ExploreModeContext.Provider value={value}>
      {children}
    </ExploreModeContext.Provider>
  )
}

export function useExploreMode() {
  const context = useContext(ExploreModeContext)
  if (!context) {
    throw new Error('useExploreMode must be used within ExploreModeProvider')
  }
  return context
}
