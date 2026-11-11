import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  MoodSelector,
  PageHeader,
  QuickExit,
  StatusMessage,
} from '../components/layout/SharedUI.jsx'
import { useAuth } from '../features/auth/authContext.js'
import { markOnboardingComplete } from '../features/auth/authClient.js'
import { getTodayEntry, saveTodayEntry } from '../features/journal/journalApi.js'
import usePageTitle from '../lib/usePageTitle.js'

// JournalPage serves both first-use onboarding and editing today's existing entry.
export default function JournalPage() {
  const [searchParams] = useSearchParams()
  const editMode = searchParams.get('mode') === 'edit'
  usePageTitle(editMode ? "Edit Today's Entry" : 'Welcome Home')

  const { displayName, logout, user } = useAuth()
  const navigate = useNavigate()
  const [content, setContent] = useState('')
  const [mood, setMood] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    getTodayEntry()
      .then((entry) => {
        if (!active || !entry) return
        setContent(entry.content || '')
        setMood(entry.mood || null)
      })
      .catch((error) => {
        if (active) setMessage(error.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [user?.id])

  // Save one complete entry, then follow the onboarding or edit return flow.
  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')

    if (!content.trim() && !mood) {
      setMessage('Choose a mood or write a short note before continuing.')
      return
    }

    setSaving(true)
    try {
      await saveTodayEntry({ content, mood })
      if (!editMode) {
        try {
          await markOnboardingComplete(user)
        } catch (metadataError) {
          console.warn('Journal saved, but onboarding metadata could not be updated.', metadataError)
          setMessage('Your entry was saved, but account setup could not be finished. Please select Continue again.')
          return
        }
      }
      navigate(editMode ? '/daily-checkin' : '/home', { replace: true })
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  // Onboarding exposes logout while edit mode uses an explicit history back link.
  async function handleLogout() {
    setMessage('')
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <div className="page-shell journal-page">
      <PageHeader
        title={editMode ? "Today's Entry" : 'BrightBridge'}
        backTo={editMode ? '/daily-checkin' : undefined}
        backLabel="Diary Entries"
        actionLabel={editMode ? undefined : 'Log Out'}
        actionDisabled={saving}
        onAction={handleLogout}
      />

      <main className="container page-main journal-main">
        <section className="welcome-section fade-in">
          <h1>Hi {displayName},<br />welcome home!</h1>
        </section>

        <form onSubmit={handleSubmit}>
          <section className="mood-checkin fade-in">
            <h2>How are you feeling today?</h2>
            <MoodSelector value={mood} onChange={setMood} disabled={loading || saving} />
          </section>

          <section className="daily-journal fade-in">
            <h2>How was your day?</h2>
            <label htmlFor="daily-entry" className="sr-only">Write about your day</label>
            <textarea
              id="daily-entry"
              className="form-textarea"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="start typing..."
              rows="6"
              maxLength="10000"
              disabled={loading || saving}
            />
            <StatusMessage tone="error">{message}</StatusMessage>
            <button type="submit" className="btn btn-primary btn-large full-width" disabled={loading || saving}>
              {saving
                ? 'Saving…'
                : editMode
                  ? 'Save Changes and Return to Daily Check-In'
                  : 'Continue to Dashboard'}
            </button>
          </section>
        </form>
      </main>
      <QuickExit />
    </div>
  )
}
