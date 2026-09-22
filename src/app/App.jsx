import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from '../features/auth/AuthProvider.jsx'
import ProtectedRoute from '../features/auth/ProtectedRoute.jsx'
import DailyCheckinPage from '../pages/DailyCheckinPage.jsx'
import { HelpPage, RelationshipHelpPage } from '../pages/HelpPages.jsx'
import HomePage from '../pages/HomePage.jsx'
import {
  ComingSoonPage,
  NotFoundPage,
  VideoComingSoonPage,
} from '../pages/InfoPages.jsx'
import JournalPage from '../pages/JournalPage.jsx'
import LandingPage from '../pages/LandingPage.jsx'
import LoginPage from '../pages/LoginPage.jsx'

// Preserve the edit query string when an old deployed HTML URL is opened.
function LegacyJournalRedirect() {
  const { search } = useLocation()
  return <Navigate to={{ pathname: '/journal/today', search }} replace />
}

// AppRoutes defines canonical React URLs plus compatibility redirects for legacy links.
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/help" element={<HelpPage />} />
      <Route path="/help/relationships/:type" element={<RelationshipHelpPage />} />
      <Route path="/grounding" element={<ComingSoonPage pageKey="grounding" />} />
      <Route path="/resources" element={<ComingSoonPage pageKey="resources" />} />
      <Route path="/conflict" element={<ComingSoonPage pageKey="conflict" />} />
      <Route path="/microskills" element={<ComingSoonPage pageKey="microskills" />} />
      <Route path="/relationship-quiz" element={<ComingSoonPage pageKey="quiz" />} />
      <Route path="/videos/:topic" element={<VideoComingSoonPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/journal/today" element={<JournalPage />} />
        <Route path="/daily-checkin" element={<DailyCheckinPage />} />
      </Route>

      <Route path="/index.html" element={<Navigate to="/" replace />} />
      <Route path="/assets/login.html" element={<Navigate to="/login" replace />} />
      <Route path="/assets/home.html" element={<Navigate to="/home" replace />} />
      <Route path="/assets/home-first-time.html" element={<LegacyJournalRedirect />} />
      <Route path="/assets/daily-checkin.html" element={<Navigate to="/daily-checkin" replace />} />
      <Route path="/assets/help.html" element={<Navigate to="/help" replace />} />
      <Route path="/assets/romantic.html" element={<Navigate to="/help/relationships/romantic" replace />} />
      <Route path="/assets/friend.html" element={<Navigate to="/help/relationships/friend" replace />} />
      <Route path="/assets/family.html" element={<Navigate to="/help/relationships/family" replace />} />
      <Route path="/assets/otherHelp.html" element={<Navigate to="/help/relationships/other" replace />} />
      <Route path="/assets/grounding.html" element={<Navigate to="/grounding" replace />} />
      <Route path="/assets/resources.html" element={<Navigate to="/resources" replace />} />
      <Route path="/assets/conflict.html" element={<Navigate to="/conflict" replace />} />
      <Route path="/assets/microskills.html" element={<Navigate to="/microskills" replace />} />
      <Route path="/assets/quiz.html" element={<Navigate to="/relationship-quiz" replace />} />
      <Route path="/assets/videos/romantic_intro.html" element={<Navigate to="/videos/romantic-intro" replace />} />
      <Route path="/assets/videos/communication.html" element={<Navigate to="/videos/communication" replace />} />
      <Route path="/assets/videos/boundaries.html" element={<Navigate to="/videos/boundaries" replace />} />
      <Route path="/assets/videos/:topic" element={<VideoComingSoonPage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

// The router and one auth provider replace all per-page widget initialization scripts.
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
