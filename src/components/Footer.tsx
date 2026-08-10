export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="page-wrap footer-inner">
        <p className="footer-copy">
          &copy; {year} Jurre Roeleveld. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
