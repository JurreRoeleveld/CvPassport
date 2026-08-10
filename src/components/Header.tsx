import { Link } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="site-header">
      <nav className="page-wrap site-nav">
        <h2 className="brand">
          <Link to="/" className="brand-link">
            <span className="brand-dot" />
            CV Passport
          </Link>
        </h2>

        <div className="header-actions">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
