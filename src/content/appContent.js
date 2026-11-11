// Shared copy keeps repeated dashboard and help cards data-driven and easy to update.
export const dashboardLinks = [
  { icon: '🧘', label: 'Grounding Tools', to: '/grounding' },
  { icon: '📚', label: 'Resources', to: '/resources' },
  { icon: '✍️', label: 'Daily Check-In', to: '/daily-checkin' },
  { icon: '🤝', label: 'Conflict De-Escalation', to: '/conflict' },
  { icon: '💬', label: 'Relationship Microskills', to: '/microskills' },
]

export const relationshipTypes = {
  romantic: {
    icon: '💕',
    label: 'Romantic Partner',
    shortDescription: 'Boyfriend, girlfriend, dating',
    title: 'Romantic Relationships',
  },
  friend: {
    icon: '👫',
    label: 'Friend',
    shortDescription: 'Classmate, best friend',
    title: 'Friend Relationships',
  },
  family: {
    icon: '👨‍👩‍👧‍👦',
    label: 'Family Member',
    shortDescription: 'Parent, sibling, relative',
    title: 'Family Relationships',
  },
  other: {
    icon: '🤝',
    label: 'Other',
    shortDescription: 'Teacher, coworker, etc.',
    title: 'Other Relationships',
  },
}

export const crisisResources = [
  {
    title: '☎️ 988 Suicide & Crisis Lifeline',
    description: 'Free and confidential support for people in distress.',
    actions: [
      { href: 'tel:988', label: '📞 Call 988' },
      { href: 'sms:988', label: '💬 Text 988', secondary: true },
    ],
  },
  {
    title: '💬 Crisis Text Line',
    description: 'Text with a trained crisis counselor.',
    actions: [{ href: 'sms:741741?body=HOME', label: '💬 Text HOME to 741741' }],
  },
  {
    title: '🏠 National Domestic Violence Hotline',
    description: 'Support for domestic violence situations.',
    actions: [
      { href: 'tel:18007997233', label: '📞 Call 1-800-799-7233' },
      { href: 'sms:88788?body=START', label: '💬 Text START to 88788', secondary: true },
    ],
  },
  {
    title: '👤 RAINN National Sexual Assault Hotline',
    description: 'Confidential support from trained staff.',
    actions: [
      { href: 'tel:18006564673', label: '📞 Call 1-800-656-4673' },
      { href: 'sms:64673?body=HOPE', label: '💬 Text HOPE to 64673', secondary: true },
    ],
  },
  {
    title: '🏳️‍🌈 The Trevor Project',
    description: 'Crisis support for LGBTQ+ young people.',
    actions: [
      { href: 'tel:18664887386', label: '📞 Call 1-866-488-7386' },
      { href: 'sms:678678?body=START', label: '💬 Text START to 678678', secondary: true },
    ],
  },
]

export const comingSoonPages = {
  grounding: {
    icon: '🧘',
    title: 'Grounding Tools',
    description: 'Breathing and grounding exercises are being prepared for this page.',
  },
  resources: {
    icon: '📚',
    title: 'Resources & Information',
    description: 'Healthy-relationship resources are being prepared for this page.',
  },
  conflict: {
    icon: '🤝',
    title: 'Conflict De-Escalation',
    description: 'Guided conflict de-escalation tools are being prepared for this page.',
  },
  microskills: {
    icon: '💬',
    title: 'Relationship Microskills',
    description: 'Short relationship skill lessons are being prepared for this page.',
  },
  quiz: {
    icon: '📝',
    title: 'Relationship Quiz',
    description: 'The relationship check-in quiz is being prepared for this page.',
  },
  video: {
    icon: '🎬',
    title: 'Video Resource',
    description: 'This video resource has not been added to the project yet.',
  },
}
