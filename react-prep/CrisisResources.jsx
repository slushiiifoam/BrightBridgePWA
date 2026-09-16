import React from 'react';
import crisisLines from './crisisLines';

// CrisisResources
//
// The crisis hotline list. On main this exact markup was copy-pasted into five
// separate files (help.html, friend.html, family.html, romantic.html,
// otherHelp.html). Here it lives once.
//
// `onBack` is optional: Help renders this as a sub-view and passes a handler,
// anything else can render it standalone and omit the back link.
function CrisisResources({ onBack }) {
  return (
    <section className="crisis-section">
      {onBack && (
        <button type="button" className="back-link" onClick={onBack}>
          &larr; Back to help options
        </button>
      )}

      <div className="alert-box emergency-alert fade-in">
        <p className="alert-text">
          &#9888;&#65039; <strong>If you&rsquo;re in immediate danger, please call 911 now.</strong>
        </p>
      </div>

      <h2 className="section-title">Crisis Hotlines</h2>
      <p className="section-subtitle">All of these are free, confidential, and available 24/7</p>

      {crisisLines.map((line, index) => (
        <div
          key={line.key}
          className="resource-card fade-in"
          style={{ animationDelay: `${(index + 1) * 0.1}s` }}
        >
          <div className="card-header">
            <h3>
              {line.icon} {line.name}
            </h3>
            <span className="badge">24/7</span>
          </div>
          <p>{line.description}</p>
          {line.actions.map((action) => (
            // Plain <a>, not <Link>: tel: and sms: must leave the SPA.
            <a key={action.href} href={action.href} className={`btn ${action.variant} btn-large`}>
              {action.label}
            </a>
          ))}
        </div>
      ))}
    </section>
  );
}

export default CrisisResources;
