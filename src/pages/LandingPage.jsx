import { Link } from 'react-router-dom'
import { BrandLogo, QuickExit } from '../components/SharedUI.jsx'
import usePageTitle from '../lib/usePageTitle.js'

// LandingPage recreates the original welcome screen without loading auth prematurely.
export default function LandingPage() {
  usePageTitle('Welcome')

  return (
    <div className="landing-page gradient-bg page-shell">
      <main className="container center-content landing-main">
        <div className="icon-container fade-in">
          <BrandLogo />
        </div>
        <Link to="/login" className="tap-enter-btn fade-in">
          Tap to Enter
        </Link>
      </main>
      <QuickExit />
    </div>
  )
}
