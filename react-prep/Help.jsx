import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CrisisResources from './CrisisResources';
import './helpFlow.css';

// Help
//
// Port of public/assets/help.html. The original showed and hid three sections
// by setting style.display directly; here that is one piece of state.
//
// Route: /help

const RELATIONSHIP_CARDS = [
  { type: 'romantic', icon: '\u{1F495}', heading: 'Romantic Partner', description: 'Boyfriend, girlfriend, dating' },
  { type: 'friend', icon: '\u{1F46B}', heading: 'Friend', description: 'Classmate, best friend' },
  { type: 'family', icon: '\u{1F468}‍\u{1F469}‍\u{1F467}‍\u{1F466}', heading: 'Family Member', description: 'Parent, sibling, relative' },
  { type: 'other', icon: '\u{1F91D}', heading: 'Other', description: 'Teacher, coworker, etc.' },
];

function Help() {
  const navigate = useNavigate();
  const [view, setView] = useState('selection');

  const show = (next) => {
    setView(next);
    window.scrollTo(0, 0);
  };

  return (
    <div className="help-flow full-height">
      <header className="help-header">
        <button type="button" className="back-button" onClick={() => navigate(-1)} aria-label="Go back">
          &larr; Back
        </button>
        <h1 className="text-center text-white">We&rsquo;re Here For You</h1>
      </header>

      <main
        className="container"
        style={{ flex: 1, paddingTop: 'var(--spacing-md)', paddingBottom: '100px' }}
      >
        {view === 'selection' && (
          <section className="help-selection fade-in">
            <p className="intro-text">Choose what you need right now:</p>

            <div className="help-category">
              <button type="button" className="help-category-btn crisis-btn" onClick={() => show('crisis')}>
                <div className="btn-content">
                  <span className="btn-icon">&#128682;</span>
                  <div className="btn-text">
                    <h3>Crisis Support</h3>
                    <p>I need immediate help</p>
                  </div>
                  <span className="btn-arrow">&rarr;</span>
                </div>
              </button>
            </div>

            <div className="help-category">
              <button type="button" className="help-category-btn" onClick={() => show('relationship')}>
                <div className="btn-content">
                  <span className="btn-icon">&#128173;</span>
                  <div className="btn-text">
                    <h3>Talk About a Relationship</h3>
                    <p>Romantic, friend, or family</p>
                  </div>
                  <span className="btn-arrow">&rarr;</span>
                </div>
              </button>
            </div>

            {/* /grounding and /resources do not exist yet -- these were
                grounding.html and resources.html in the original and neither
                file is in the repo. Jaziel/Sebastian own those routes. */}
            <div className="help-category">
              <Link className="help-category-btn" to="/grounding">
                <div className="btn-content">
                  <span className="btn-icon">&#129496;</span>
                  <div className="btn-text">
                    <h3>Calm Down Tools</h3>
                    <p>Breathing &amp; grounding exercises</p>
                  </div>
                  <span className="btn-arrow">&rarr;</span>
                </div>
              </Link>
            </div>

            <div className="help-category">
              <Link className="help-category-btn" to="/resources">
                <div className="btn-content">
                  <span className="btn-icon">&#128218;</span>
                  <div className="btn-text">
                    <h3>Resources &amp; Info</h3>
                    <p>Learn about healthy relationships</p>
                  </div>
                  <span className="btn-arrow">&rarr;</span>
                </div>
              </Link>
            </div>
          </section>
        )}

        {view === 'crisis' && <CrisisResources onBack={() => show('selection')} />}

        {view === 'relationship' && (
          <section className="relationship-section">
            <button type="button" className="back-link" onClick={() => show('selection')}>
              &larr; Back to help options
            </button>

            <h2 className="section-title">Who is this about?</h2>
            <p className="section-subtitle">This helps us show you the most relevant resources</p>

            <div className="relationship-grid">
              {RELATIONSHIP_CARDS.map((card) => (
                <button
                  key={card.type}
                  type="button"
                  className="relationship-card"
                  onClick={() => navigate(`/help/${card.type}`)}
                >
                  <span className="card-icon">{card.icon}</span>
                  <h3>{card.heading}</h3>
                  <p>{card.description}</p>
                </button>
              ))}
            </div>

            <div className="info-box mt-lg">
              <p>&#128161; <strong>Not sure if you need help?</strong></p>
              <p>It&rsquo;s always okay to reach out. Your feelings are valid, and you deserve support.</p>
            </div>
          </section>
        )}
      </main>

      {/* Swap for the shared quick-exit component if the base has one. */}
      <a
        href="https://www.weather.com"
        className="quick-exit"
        aria-label="Quick exit to weather website"
      >
        quick exit
      </a>
    </div>
  );
}

export default Help;
