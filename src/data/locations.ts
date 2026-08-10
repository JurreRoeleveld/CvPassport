export type CvLocation = {
  id: string
  name: string
  period: string
  role: string
  description: string
  /** [longitude, latitude] */
  coordinates: [number, number]
  zoom: number
}

// Placeholder story — replace with your own locations and copy.
export const LOCATIONS: Array<CvLocation> = [
  {
    id: 'amsterdam',
    name: 'Amsterdam',
    period: '1995 — 2013',
    role: 'Where it all started',
    description:
      'Grew up here. Took apart more electronics than I managed to put back together, and wrote my first lines of code.',
    coordinates: [4.9041, 52.3676],
    zoom: 11.5,
  },
  {
    id: 'utrecht',
    name: 'Utrecht',
    period: '2013 — 2018',
    role: 'Computer Science',
    description:
      'Studied computer science, discovered a love for building things people actually use, and shipped my first real projects.',
    coordinates: [5.1214, 52.0907],
    zoom: 12,
  },
  {
    id: 'groenlo',
    name: 'Groenlo',
    period: '2018 — now',
    role: 'Software Engineer at Nedap',
    description:
      'Building healthcare software that matters, from front-end architecture to the systems behind it.',
    coordinates: [6.6156, 52.0402],
    zoom: 12.5,
  },
]
