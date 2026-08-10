export type CvLocation = {
  id: string
  name: string
  period: string
  role: string
  description: string
  kind: 'education' | 'work' | 'home'
  highlights?: Array<string>
  tags?: Array<string>
  /** [longitude, latitude] */
  coordinates: [number, number]
  zoom: number
}

export const LOCATIONS: Array<CvLocation> = [
  {
    id: 'oldenzaal',
    name: 'Oldenzaal',
    period: '2008 — 2015',
    role: 'Atheneum, Thij College',
    description: 'Pre-university education.',
    kind: 'education',
    coordinates: [6.9098, 52.3177],
    zoom: 12,
  },
  {
    id: 'groningen',
    name: 'Groningen',
    period: '2015 — 2021',
    role: 'University of Groningen',
    kind: 'education',
    description:
      'BSc Life, Science and Technology (Biomedical Engineering track) followed by an MSc Biomedical Engineering, specializing in medical device design.',
    highlights: [
      'Served as Chairman of GLV Idun, a study association with over 1,800 members.',
    ],
    coordinates: [6.5625, 53.2197],
    zoom: 11,
  },
  {
    id: 'enschede',
    name: 'Enschede',
    period: '2021 — 2022',
    role: 'Computer Science, University of Twente',
    kind: 'education',
    description:
      'Employer-sponsored traineeship combining Computer Science coursework with software engineering at Nedap.',
    coordinates: [6.8509, 52.2433],
    zoom: 11,
  },
  {
    id: 'groenlo',
    name: 'Groenlo',
    period: '2021 — now',
    role: 'Software Engineer at Nedap',
    kind: 'work',
    description:
      'Developing and maintaining the React-based Dossier application, a core part of Nedap’s healthcare suite, translating care workflows and interoperability standards into intuitive interfaces.',
    highlights: [
      'Technical lead for a team of five engineers, most recently the migration and modernization of the resuscitation policy workflow.',
      'Built reusable micro-frontend widgets shared across multiple healthcare applications.',
      'Spent six months on the Frontend Framework Team, building an accessible component library aligned with the department-wide design system.',
      'Mentored a student for 2.5 years, providing technical guidance and supporting their professional growth.',
    ],
    tags: [
      'React',
      'Vue',
      'Lit',
      'TypeScript',
      'Ruby on Rails',
      'Vitest',
      'Cypress',
      'Playwright',
      'Vite',
      'TanStack Query',
      'Zustand',
      'Pinia',
    ],
    coordinates: [6.6246, 52.037],
    zoom: 11,
  },
]

// Where I live today. Backs the intro section: the story opens here, and the
// map keeps a distinct home marker in explore mode.
export const HOME: CvLocation = {
  id: 'utrecht',
  name: 'Utrecht',
  period: 'Today',
  role: 'Home',
  description: 'Where I live today, and where this journey begins.',
  kind: 'home',
  coordinates: [5.1214, 52.0907],
  zoom: 11.5,
}
