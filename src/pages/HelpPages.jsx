import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  PageHeader,
  QuickExit,
} from '../components/layout/SharedUI.jsx'
import { crisisResources, relationshipTypes } from '../content/appContent.js'
import { useAuth } from '../features/auth/authContext.js'
import usePageTitle from '../lib/usePageTitle.js'

// HelpOption renders the same card semantics as either a route link or local view button.
function HelpOption({ icon, title, description, onClick, to, crisis = false }) {
  const content = (
    <span className="help-option__content">
      <span className="help-option__icon" aria-hidden="true">{icon}</span>
      <span className="help-option__text">
        <strong>{title}</strong>
        <span>{description}</span>
      </span>
      <span className="help-option__arrow" aria-hidden="true">→</span>
    </span>
  )

  const className = `help-option${crisis ? ' help-option--crisis' : ''}`
  return to ? (
    <Link to={to} className={className}>{content}</Link>
  ) : (
    <button type="button" className={className} onClick={onClick}>{content}</button>
  )
}

// CrisisResources keeps current phone/text actions in one data-driven list.
function CrisisResources({ onBack }) {
  return (
    <section className="fade-in">
      <button type="button" className="back-link" onClick={onBack}>← Back to help options</button>
      <div className="emergency-alert">
        ⚠️ <strong>If you&apos;re in immediate danger, call 911 now.</strong>
      </div>
      <h2>Crisis Hotlines</h2>
      <p className="section-subtitle">These services offer free, confidential support.</p>

      {crisisResources.map((resource) => (
        <article key={resource.title} className="resource-card">
          <div className="resource-card__header">
            <h3>{resource.title}</h3>
            <span className="badge">24/7</span>
          </div>
          <p>{resource.description}</p>
          <div className="resource-actions">
            {resource.actions.map((action) => (
              <a
                key={action.href}
                href={action.href}
                className={`btn ${action.secondary ? 'btn-light' : 'btn-primary'}`}
              >
                {action.label}
              </a>
            ))}
          </div>
        </article>
      ))}
    </section>
  )
}

// RelationshipPicker routes to one parameterized page instead of four duplicated files.
function RelationshipPicker({ onBack }) {
  return (
    <section className="fade-in">
      <button type="button" className="back-link" onClick={onBack}>← Back to help options</button>
      <h2>Who is this about?</h2>
      <p className="section-subtitle">This helps us show you the most relevant resources.</p>
      <div className="relationship-grid">
        {Object.entries(relationshipTypes).map(([type, details]) => (
          <Link key={type} to={`/help/relationships/${type}`} className="relationship-card">
            <span className="relationship-card__icon" aria-hidden="true">{details.icon}</span>
            <strong>{details.label}</strong>
            <span>{details.shortDescription}</span>
          </Link>
        ))}
      </div>
      <div className="info-box">
        <p>💡 <strong>Not sure if you need help?</strong></p>
        <p>It&apos;s always okay to reach out. Your feelings are valid, and you deserve support.</p>
      </div>
    </section>
  )
}

// HelpPage uses React state in place of five copies of DOM show/hide scripts.
export function HelpPage() {
  usePageTitle('Help & Support')
  const { status } = useAuth()
  const [view, setView] = useState('menu')
  const backTo = status === 'authenticated' ? '/home' : '/'

  return (
    <div className="page-shell help-page">
      <PageHeader title="We're Here For You" backTo={backTo} />
      <main className="container page-main help-main">
        {view === 'menu' ? (
          <section className="fade-in">
            <p className="intro-text">Choose what you need right now:</p>
            <div className="help-options">
              <HelpOption
                icon="🆘"
                title="Crisis Support"
                description="I need immediate help"
                onClick={() => setView('crisis')}
                crisis
              />
              <HelpOption
                icon="💭"
                title="Talk About a Relationship"
                description="Romantic, friend, or family"
                onClick={() => setView('relationships')}
              />
              <HelpOption
                icon="🧘"
                title="Calm Down Tools"
                description="Breathing & grounding exercises"
                to="/grounding"
              />
              <HelpOption
                icon="📚"
                title="Resources & Info"
                description="Learn about healthy relationships"
                to="/resources"
              />
            </div>
          </section>
        ) : null}
        {view === 'crisis' ? <CrisisResources onBack={() => setView('menu')} /> : null}
        {view === 'relationships' ? <RelationshipPicker onBack={() => setView('menu')} /> : null}
      </main>
      <QuickExit />
    </div>
  )
}

// One parameterized page replaces the four duplicated relationship HTML files.
export function RelationshipHelpPage() {
  const { type } = useParams()
  const details = relationshipTypes[type]
  usePageTitle(details?.title || 'Relationship Help')

  if (!details) return <Navigate to="/help" replace />

  const resources = [
    {
      icon: '🎬',
      title: `${details.title}: Intro Video`,
      description: 'Short overview and tips',
      to: `/videos/${type}-intro`,
    },
    {
      icon: '🗣️',
      title: 'Communication',
      description: 'How to talk about feelings and boundaries',
      to: '/videos/communication',
    },
    {
      icon: '🔒',
      title: 'Boundaries',
      description: 'Setting and respecting limits',
      to: '/videos/boundaries',
    },
    {
      icon: '📝',
      title: 'Take the Quiz',
      description: 'Quick quiz to identify next steps',
      to: '/relationship-quiz',
    },
  ]

  return (
    <div className="page-shell help-page">
      <PageHeader title="We're Here For You" backTo="/help" backLabel="Help" />
      <main className="container page-main help-main">
        <section className="fade-in">
          <p className="intro-text">{details.title}</p>
          <div className="help-options">
            {resources.map((resource) => (
              <HelpOption key={resource.to} {...resource} />
            ))}
          </div>
          <div className="info-box">
            <p><strong>You deserve relationships that feel safe and respectful.</strong></p>
            <p>If you feel unsafe now, return to Help and choose Crisis Support.</p>
          </div>
        </section>
      </main>
      <QuickExit />
    </div>
  )
}
