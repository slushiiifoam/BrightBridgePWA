import React from 'react';
import { Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import relationships, { SHARED_CARDS } from './relationships';
import './helpFlow.css';

// RelationshipHelp
//
// Replaces four pages: friend.html, family.html, romantic.html, otherHelp.html.
// Those files were 540 lines each and differed in exactly three lines, so the
// differences live in relationships.js and the markup lives here once.
//
// Route: /help/:type  where type is romantic | friend | family | other
//
// Dropped from the original on purpose: each of the four HTML files also
// carried a full copy of the crisis section and the relationship picker, both
// with style="display: none". Neither could ever be shown -- the pages defined
// hideCrisisOptions() and hideRelationshipOptions() but no matching show
// functions. That was ~200 lines of unreachable markup per file. Crisis
// content now lives in CrisisResources and is reached from Help.
function RelationshipHelp() {
  const { type } = useParams();
  const navigate = useNavigate();

  const content = relationships[type];

  // Unknown :type in the URL -- send them to the help hub rather than crashing.
  if (!content) {
    return <Navigate to="/help" replace />;
  }

  const cards = [
    {
      key: 'intro-video',
      icon: '\u{1F3AC}',
      heading: content.introVideoHeading,
      description: 'Short overview and tips',
      path: content.introVideoPath,
      ariaLabel: `Watch ${content.introText} intro video`,
    },
    ...SHARED_CARDS,
  ];

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
        <section className="help-selection fade-in">
          <p className="intro-text">{content.introText}</p>

          {cards.map((card) => (
            <div className="help-category" key={card.key}>
              <Link className="help-category-btn" to={card.path} aria-label={card.ariaLabel}>
                <div className="btn-content">
                  <span className="btn-icon">{card.icon}</span>
                  <div className="btn-text">
                    <h3>{card.heading}</h3>
                    <p>{card.description}</p>
                  </div>
                  <span className="btn-arrow">&rarr;</span>
                </div>
              </Link>
            </div>
          ))}
        </section>
      </main>

      {/* If the React base already provides a shared quick-exit component
          (Ivan's branch had src/smaller_components/Emergency.js), import that
          instead and delete this link. */}
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

export default RelationshipHelp;
