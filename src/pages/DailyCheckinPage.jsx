import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  HelpFab,
  PageHeader,
  QuickExit,
  StatusMessage,
} from '../components/layout/SharedUI.jsx'
import { useAuth } from '../features/auth/authContext.js'
import { getRecentEntries } from '../features/journal/journalApi.js'
import usePageTitle from '../lib/usePageTitle.js'

const moodDisplay = {
  happy: { emoji: '😊', label: 'Happy' },
  neutral: { emoji: '😐', label: 'Neutral' },
  sad: { emoji: '☹️', label: 'Sad' },
}

// Parse the database date at local midnight so time zones do not shift the day.
function formatDate(dateValue) {
  if (!dateValue) return ''
  return new Date(`${dateValue}T00:00:00`).toLocaleDateString()
}

// React renders journal text safely and preserves its line breaks through CSS.
function JournalEntryCard({ entry }) {
  const mood = moodDisplay[entry.mood] || { emoji: '📝', label: 'Not selected' }
  return (
    <article className={`journal-entry-card mood-${entry.mood || 'none'}`}>
      <div className="entry-top-row">
        <p className="entry-date">{formatDate(entry.date)}</p>
        <div className="entry-mood-badge" aria-label={`Mood ${mood.label}`}>
          <span aria-hidden="true">{mood.emoji}</span>
          <span>{mood.label}</span>
        </div>
      </div>
      <p className="entry-content">{entry.content || 'No journal note for this day.'}</p>
    </article>
  )
}

// DailyCheckinPage loads journal history once the protected session is ready.
export default function DailyCheckinPage() {
  usePageTitle('Daily Check-In')
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getRecentEntries(10)
      .then((nextEntries) => {
        if (active) setEntries(nextEntries)
      })
      .catch((historyError) => {
        if (active) setError(historyError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [user?.id])

  return (
    <div className="page-shell app-background">
      <PageHeader title="Daily Check-In" backTo="/home" backLabel="Home" />
      <main className="container page-main page-main--with-fab">
        <section className="card fade-in">
          <h2>Choose an option</h2>
          <p>Start a new daily entry or review your recent journal history.</p>
          <Link to="/journal/today?mode=edit" className="btn btn-primary btn-large full-width">
            Open/Edit Today&apos;s Entry
          </Link>
        </section>

        <section className="card history-shell" aria-live="polite">
          <h2>Last 10 Journal Entries</h2>
          <StatusMessage tone="error">{error}</StatusMessage>
          {loading ? <p>Loading your entries…</p> : null}
          {!loading && !error && entries.length === 0 ? (
            <div className="entry-empty">
              <p>No journal entries yet.</p>
              <p>Your last 10 entries will appear here automatically.</p>
            </div>
          ) : null}
          {entries.map((entry) => (
            <JournalEntryCard key={entry.date} entry={entry} />
          ))}
        </section>
      </main>
      <HelpFab />
      <QuickExit />
    </div>
  )
}
