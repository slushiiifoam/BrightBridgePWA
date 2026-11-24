export const TOPICS = [
  'crisis',
  'abuse',
  'control',
  'consent',
  'boundaries',
  'communication',
  'conflict',
  'breakup',
  'dating',
  'friendship',
  'family',
  'bullying',
  'stress',
  'self-esteem',
]

// available: false means the page is still "Coming Soon" and must not be recommended yet.
export const storedResources = [
  // Hotlines: numbers copied from crisisResources in appContent.js
  {
    id: 'crisis-988',
    kind: 'hotline',
    title: '988 Suicide & Crisis Lifeline',
    summary: 'Free, confidential 24/7 call or text support for anyone in emotional distress.',
    href: 'tel:988',
    topics: ['crisis', 'stress'],
    available: true,
  },
  {
    id: 'crisis-text-line',
    kind: 'hotline',
    title: 'Crisis Text Line',
    summary: 'Text HOME to 741741 to reach a trained crisis counselor.',
    href: 'sms:741741?body=HOME',
    topics: ['crisis', 'stress'],
    available: true,
  },
  {
    id: 'crisis-dv-hotline',
    kind: 'hotline',
    title: 'National Domestic Violence Hotline',
    summary: 'Call 1-800-799-7233 or text START to 88788 for help with abuse or an unsafe relationship.',
    href: 'tel:18007997233',
    topics: ['crisis', 'abuse', 'control'],
    available: true,
  },
  {
    id: 'crisis-rainn',
    kind: 'hotline',
    title: 'RAINN National Sexual Assault Hotline',
    summary: 'Confidential support from trained staff at 1-800-656-4673.',
    href: 'tel:18006564673',
    topics: ['crisis', 'consent', 'abuse'],
    available: true,
  },
  {
    id: 'crisis-trevor',
    kind: 'hotline',
    title: 'The Trevor Project',
    summary: 'Crisis support for young people by phone or text.',
    href: 'tel:18664887386',
    topics: ['crisis'],
    available: true,
  },

  // App pages that already work (routes from src/app/App.jsx)
  {
    id: 'help-hub',
    kind: 'page',
    title: 'Help & Support',
    summary: 'Pick crisis support, relationship help, calm-down tools, or learning resources.',
    href: '/help',
    topics: ['crisis', 'communication'],
    available: true,
  },
  {
    id: 'help-romantic',
    kind: 'page',
    title: 'Romantic Relationships',
    summary: 'Help for dating relationships: communication, boundaries, and next steps.',
    href: '/help/relationships/romantic',
    topics: ['dating', 'communication', 'boundaries', 'breakup', 'control'],
    available: true,
  },
  {
    id: 'help-friend',
    kind: 'page',
    title: 'Friend Relationships',
    summary: 'Help with friendships, classmates, and falling out with a best friend.',
    href: '/help/relationships/friend',
    topics: ['friendship', 'communication', 'boundaries', 'bullying'],
    available: true,
  },
  {
    id: 'help-family',
    kind: 'page',
    title: 'Family Relationships',
    summary: 'Help with parents, siblings, and relatives.',
    href: '/help/relationships/family',
    topics: ['family', 'communication', 'boundaries', 'conflict'],
    available: true,
  },
  {
    id: 'help-other',
    kind: 'page',
    title: 'Other Relationships',
    summary: 'Help with teachers, coworkers, and other people in your life.',
    href: '/help/relationships/other',
    topics: ['communication', 'boundaries', 'conflict'],
    available: true,
  },
  {
    id: 'daily-journal',
    kind: 'tool',
    title: 'Daily Check-In Journal',
    summary: 'Write down how today went and how you feel.',
    href: '/journal/today',
    topics: ['stress', 'self-esteem'],
    available: true,
  },
  {
    id: 'checkin-history',
    kind: 'tool',
    title: 'Check-In History',
    summary: 'Look back at your recent journal entries and moods.',
    href: '/daily-checkin',
    topics: ['stress', 'self-esteem'],
    available: true,
  },

  // Coming Soon pages: flip available to true when the page ships
  {
    id: 'grounding-tools',
    kind: 'tool',
    title: 'Grounding Tools',
    summary: 'Breathing and grounding exercises for calming down.',
    href: '/grounding',
    topics: ['stress', 'conflict'],
    available: false,
  },
  {
    id: 'conflict-deescalation',
    kind: 'tool',
    title: 'Conflict De-Escalation',
    summary: 'Guided steps for cooling down an argument.',
    href: '/conflict',
    topics: ['conflict', 'communication'],
    available: false,
  },
  {
    id: 'microskills',
    kind: 'lesson',
    title: 'Relationship Microskills',
    summary: 'Short lessons on listening, asking for what you need, and repair.',
    href: '/microskills',
    topics: ['communication', 'boundaries'],
    available: false,
  },
  {
    id: 'video-boundaries',
    kind: 'video',
    title: 'Boundaries video',
    summary: 'Setting and respecting limits.',
    href: '/videos/boundaries',
    topics: ['boundaries', 'consent'],
    available: false,
  },
]

// Each topic: everyday words that point to it, plus a fixed literature search (used in Step 4).
// The user's own text never goes to the search APIs; only these fixed queries do.
export const assistantTopics = {
  abuse: {
    keywords: ['abuse', 'abusive', 'hit me', 'hits me', 'hurt me', 'hurts me', 'violent', 'violence', 'push me', 'pushes me', 'unsafe', 'scared of'],
    literature: '"dating violence" OR "intimate partner violence"',
  },
  control: {
    keywords: ['jealous', 'controlling', 'control', 'checks my phone', 'tracks me', 'possessive', 'isolat', 'manipulat'],
    literature: '"controlling behavior" OR "coercive control" OR jealousy',
  },
  consent: {
    keywords: ['consent', 'pressure', 'pressured', 'nudes', 'touch'],
    literature: '"sexual consent" OR "sexual coercion"',
  },
  boundaries: {
    keywords: ['boundar', 'limit', 'say no', 'saying no', 'space', 'too much'],
    literature: '"interpersonal boundaries" OR assertiveness',
  },
  communication: {
    keywords: ['talk', 'communicat', 'tell', 'listen', 'conversation', 'express', 'feelings', 'ignore'],
    literature: '"communication skills" OR "relationship communication"',
  },
  conflict: {
    keywords: ['fight', 'argu', 'conflict', 'yell', 'mad at', 'angry', 'disagree'],
    literature: '"conflict resolution" OR "conflict management"',
  },
  breakup: {
    keywords: ['break up', 'breakup', 'broke up', 'dumped', 'my ex', 'heartbreak'],
    literature: '"romantic breakup" OR "relationship dissolution"',
  },
  dating: {
    keywords: ['boyfriend', 'girlfriend', 'partner', 'dating', 'crush'],
    literature: '"adolescent romantic relationships" OR "healthy dating relationships"',
  },
  friendship: {
    keywords: ['friend', 'bestie', 'classmate', 'left out', 'group chat'],
    literature: '"friendship quality" OR "peer relationships"',
  },
  family: {
    keywords: ['mom', 'dad', 'parent', 'sibling', 'brother', 'sister', 'family', 'grandm', 'grandp', 'stepmom', 'stepdad'],
    literature: '"parent-adolescent conflict" OR "family communication"',
  },
  bullying: {
    keywords: ['bully', 'bullied', 'harass', 'mean to me', 'rumor', 'cyber'],
    literature: 'bullying OR cyberbullying OR "peer victimization"',
  },
  stress: {
    keywords: ['stress', 'anxious', 'anxiety', 'overwhelm', 'panic', 'calm', 'sad', 'lonely', 'depress', 'cope', 'coping'],
    literature: '"coping strategies" OR "emotion regulation"',
  },
  'self-esteem': {
    keywords: ['self esteem', 'self-esteem', 'confidence', 'worthless', 'not good enough', 'insecure'],
    literature: '"self-esteem" OR "self-compassion"',
  },
}
