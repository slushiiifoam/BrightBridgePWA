import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { HelpFab, PageHeader, QuickExit, StatusMessage } from '../components/layout/SharedUI.jsx'
import { askAssistant, getAssistantUsage } from '../features/assistant/assistantApi.js'
import usePageTitle from '../lib/usePageTitle.js'

const MAX_QUESTION_LENGTH = 500

// Internal routes use the router; phone, text, and web links stay plain anchors.
function ResourceLink({ href, children }) {
  return href.startsWith('/')
    ? <Link to={href} className="btn btn-primary">{children}</Link>
    : <a href={href} className="btn btn-primary">{children}</a>
}

// AssistantPage asks for one situation and shows stored and research recommendations.
export default function AssistantPage() {
  usePageTitle('Find Resources')
  const [question, setQuestion] = useState('')
  const [usage, setUsage] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getAssistantUsage().then(setUsage).catch(() => setUsage(null))
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!question.trim() || loading) return
    setLoading(true)
    setError('')
    try {
      const payload = await askAssistant(question)
      setResult(payload)
      setUsage(payload.usage)
    } catch (requestError) {
      setError(requestError.message)
      if (requestError.status === 429) setUsage((current) => current && { ...current, remaining: 0 })
    } finally {
      setLoading(false)
    }
  }

  const outOfRequests = usage?.remaining === 0

  return (
    <div className="page-shell app-background">
      <PageHeader title="Find Resources" backTo="/home" backLabel="Home" />
      <main className="container page-main page-main--with-fab">
        <form className="card fade-in" onSubmit={handleSubmit}>
          <h2>What&apos;s going on?</h2>
          <p className="section-subtitle">
            Describe your situation and we&apos;ll suggest BrightBridge resources and research that may help.
          </p>
          <label htmlFor="assistant-question" className="sr-only">Describe your situation</label>
          <textarea
            id="assistant-question"
            className="form-textarea"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="e.g. My friend and I keep fighting over small things"
            rows="4"
            maxLength={MAX_QUESTION_LENGTH}
            disabled={loading || outOfRequests}
          />
          <button type="submit" className="btn btn-primary full-width" disabled={loading || outOfRequests || !question.trim()}>
            {loading ? 'Finding resources…' : 'Find resources'}
          </button>
          {usage ? (
            <p className="assistant-usage">{usage.remaining} of {usage.limit} requests left today</p>
          ) : null}
          <StatusMessage tone="error">{error}</StatusMessage>
        </form>

        {result ? (
          <section className="fade-in" aria-live="polite">
            {result.crisis ? (
              <div className="emergency-alert">⚠️ <strong>If you&apos;re in immediate danger, call 911 now.</strong></div>
            ) : null}
            <div className="info-box"><p>{result.note}</p></div>

            {result.stored.length ? <h2>From BrightBridge</h2> : null}
            {result.stored.map((resource) => (
              <article key={resource.id} className="resource-card">
                <div className="resource-card__header">
                  <h3>{resource.title}</h3>
                  {resource.kind === 'hotline' ? <span className="badge">24/7</span> : null}
                </div>
                <p>{resource.reason}</p>
                <div className="resource-actions">
                  <ResourceLink href={resource.href}>Open</ResourceLink>
                </div>
              </article>
            ))}

            {result.papers.length ? <h2>Peer-reviewed research</h2> : null}
            {result.papers.map((paper) => (
              <article key={paper.url} className="resource-card">
                <h3>{paper.title}</h3>
                <p className="assistant-citation">
                  {[paper.authors, paper.venue, paper.year].filter(Boolean).join(' · ')}
                </p>
                <p>{paper.reason}</p>
                <div className="resource-actions">
                  <a href={paper.url} className="btn btn-light" target="_blank" rel="noreferrer">Read the study</a>
                </div>
              </article>
            ))}
          </section>
        ) : null}
      </main>
      <HelpFab />
      <QuickExit />
    </div>
  )
}
