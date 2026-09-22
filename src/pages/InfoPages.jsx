import { Link, useParams } from 'react-router-dom'
import { PageHeader, QuickExit } from '../components/SharedUI.jsx'
import { comingSoonPages } from '../content/appContent.js'
import { useAuth } from '../features/auth/authContext.js'
import usePageTitle from '../lib/usePageTitle.js'

// Missing legacy destinations now render honestly instead of returning index.html with a false 200.
export function ComingSoonPage({ pageKey }) {
  const details = comingSoonPages[pageKey]
  const { status } = useAuth()
  usePageTitle(details.title)
  const backTo = status === 'authenticated' ? '/home' : '/help'

  return (
    <div className="page-shell app-background">
      <PageHeader title={details.title} backTo={backTo} backLabel={status === 'authenticated' ? 'Home' : 'Help'} />
      <main className="container page-center">
        <section className="card coming-soon-card fade-in">
          <span className="coming-soon-icon" aria-hidden="true">{details.icon}</span>
          <h2>Coming soon</h2>
          <p>{details.description}</p>
          <Link to={backTo} className="btn btn-primary">
            {status === 'authenticated' ? 'Return to Dashboard' : 'Return to Help'}
          </Link>
        </section>
      </main>
      <QuickExit />
    </div>
  )
}

// Show which missing legacy video was requested without pretending the asset exists.
export function VideoComingSoonPage() {
  const { topic } = useParams()
  const details = comingSoonPages.video
  const readableTopic = String(topic || 'relationship')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
  usePageTitle(`${readableTopic} Video`)

  return (
    <div className="page-shell app-background">
      <PageHeader title="Video Resource" backTo="/help" backLabel="Help" />
      <main className="container page-center">
        <section className="card coming-soon-card fade-in">
          <span className="coming-soon-icon" aria-hidden="true">{details.icon}</span>
          <h2>{readableTopic}</h2>
          <p>{details.description}</p>
          <Link to="/help" className="btn btn-primary">Return to Help</Link>
        </section>
      </main>
      <QuickExit />
    </div>
  )
}

// Keep unknown URLs inside the app with a clear recovery route.
export function NotFoundPage() {
  usePageTitle('Page Not Found')
  return (
    <div className="page-shell app-background">
      <main className="container page-center">
        <section className="card coming-soon-card">
          <span className="coming-soon-icon" aria-hidden="true">🌉</span>
          <h1>Page not found</h1>
          <p>The address may be outdated or typed incorrectly.</p>
          <Link to="/" className="btn btn-primary">Return to BrightBridge</Link>
        </section>
      </main>
      <QuickExit />
    </div>
  )
}
