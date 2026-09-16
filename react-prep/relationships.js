// relationships.js
//
// Content for the four relationship help pages.
//
// On main these are four separate files -- friend.html, family.html,
// romantic.html and otherHelp.html -- at 540 lines each. They differ in
// exactly three lines: the <title>, the .intro-text paragraph, and the <h3>
// of the first card. Everything else, including the 304-line <style> block,
// is byte-identical.
//
// So instead of four components we keep one component (RelationshipHelp) and
// drive it from this table, keyed by the :type route param.
//
// NOTE: the video and quiz pages referenced below do not exist in the repo
// yet -- there is no public/assets/videos/ directory and no quiz.html. The
// paths are kept so the links are easy to wire up once those pages are built.
//
// KNOWN BUG IN THE ORIGINAL: all four HTML pages pointed their intro video at
// videos/romantic_intro.html, so the friend, family and other pages linked to
// the romantic video. Per-type paths are used here instead.

export const RELATIONSHIP_TYPES = ['romantic', 'friend', 'family', 'other'];

const relationships = {
  romantic: {
    title: 'Romantic Help',
    introText: 'Romantic Relationships',
    introVideoHeading: 'Romantic: Intro Video',
    introVideoPath: '/videos/romantic-intro',
  },
  friend: {
    title: 'Friend Help',
    introText: 'Friendly Relationships',
    introVideoHeading: 'Friendship: Intro Video',
    introVideoPath: '/videos/friend-intro',
  },
  family: {
    title: 'Familial Help',
    introText: 'Familial Relationships',
    introVideoHeading: 'Families: Intro Video',
    introVideoPath: '/videos/family-intro',
  },
  other: {
    title: 'Other Help',
    introText: 'Other Relationships',
    introVideoHeading: 'Other Relationships: Intro Video',
    introVideoPath: '/videos/other-intro',
  },
};

// Cards shown on every relationship page. Only the first one varies by type,
// so it is filled in by the component from the table above.
export const SHARED_CARDS = [
  {
    key: 'communication',
    icon: '\u{1F5E3}️',
    heading: 'Communication',
    description: 'How to talk about feelings and boundaries',
    path: '/videos/communication',
    ariaLabel: 'Watch Communication Video',
  },
  {
    key: 'boundaries',
    icon: '\u{1F512}',
    heading: 'Boundaries',
    description: 'Setting and respecting limits',
    path: '/videos/boundaries',
    ariaLabel: 'Watch Boundaries Video',
  },
  {
    key: 'quiz',
    icon: '\u{1F4DD}',
    heading: 'Take the Quiz',
    description: 'Quick quiz to identify next steps',
    path: '/quiz',
    ariaLabel: 'Take the relationship quiz',
  },
];

export default relationships;
