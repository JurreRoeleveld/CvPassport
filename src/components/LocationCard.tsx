import type { CvLocation } from '../data/locations'

export default function LocationCard({ location }: { location: CvLocation }) {
  return (
    <>
      <p className="island-kicker">{location.period}</p>
      <h2 className="display-title location-title">{location.name}</h2>
      <p className="location-role">{location.role}</p>
      <p className="location-desc">{location.description}</p>
      {location.highlights && (
        <ul className="location-highlights">
          {location.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      )}
      {location.tags && (
        <ul className="location-tags">
          {location.tags.map((tag) => (
            <li key={tag} className="location-tag">
              {tag}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
