import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  HelpFab,
  MoodSelector,
  QuickExit,
  StatusMessage,
} from '../components/layout/SharedUI.jsx'
import { dashboardLinks } from '../content/appContent.js'
import { useAuth } from '../features/auth/authContext.js'
import { getTodayEntry, saveTodayEntry } from '../features/journal/journalApi.js'
import usePageTitle from '../lib/usePageTitle.js'

// HomePage combines the old dashboard with the same journal-backed mood record.
export default function HomePage() {
  usePageTitle('Dashboard')
  const { displayName, logout, user } = useAuth()
  const navigate = useNavigate()
  const [mood, setMood] = useState(null)
  const [todayContent, setTodayContent] = useState('')
  const [loadedUserId, setLoadedUserId] = useState('')
  const [savingMood, setSavingMood] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [statusTone, setStatusTone] = useState('info')

  useEffect(() => {
    let active = true
    getTodayEntry()
      .then((entry) => {
        if (!active) return
        if (entry) {
          setMood(entry.mood)
          setTodayContent(entry.content || '')
        }
        setLoadedUserId(user.id)
      })
      .catch((error) => {
        if (!active) return
        setStatusTone('error')
        setStatusMessage(error.message)
      })

    return () => {
      active = false
    }
  }, [user?.id])

  // Save quick check-ins to the same daily row used by the full journal editor.
  async function handleMoodChange(nextMood) {
    const previousMood = mood
    setMood(nextMood)
    setSavingMood(true)
    setStatusMessage('')

    try {
      const saved = await saveTodayEntry({ content: todayContent, mood: nextMood })
      setTodayContent(saved?.content || '')
      setStatusTone('success')
      setStatusMessage('Mood logged! Thank you for checking in.')
    } catch (error) {
      setMood(previousMood)
      setStatusTone('error')
      setStatusMessage(error.message)
    } finally {
      setSavingMood(false)
    }
  }

  // Complete Identity logout before returning to the public login page.
  async function handleLogout() {
    setStatusMessage('')
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (error) {
      setStatusTone('error')
      setStatusMessage(error.message)
    }
  }

  return (
    <div className="page-shell app-background">
      <header className="dashboard-header gradient-header">
        <div className="container dashboard-header__inner">
          <div>
            <h1>BrightBridge</h1>
            <p>Welcome back, {displayName}</p>
          </div>
          <button type="button" className="header-control" onClick={handleLogout}>Log Out</button>
        </div>
      </header>

      <main className="container page-main page-main--with-fab">
        <section className="card daily-checkin-card fade-in">
          <h2>Daily Check-In</h2>
          <p>How are you feeling today?</p>
          <MoodSelector value={mood} onChange={handleMoodChange} disabled={loadedUserId !== user?.id || savingMood} compact />
          <StatusMessage tone={statusTone}>{statusMessage}</StatusMessage>
        </section>

        <nav className="main-nav" aria-label="Main navigation">
          <ul className="nav-list">
            {dashboardLinks.map((item, index) => (
              <li key={item.to} className="nav-item fade-in" style={{ animationDelay: `${(index + 1) * 0.08}s` }}>
                <Link to={item.to} className="nav-link">
                  <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <section className="need-help-card card">
          <h2>Need Help Right Now?</h2>
          <p>Tap the red HELP button anytime for immediate support and resources.</p>
        </section>
      </main>

      <HelpFab />
      <QuickExit />
    </div>
  )
}
