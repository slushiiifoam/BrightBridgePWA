// crisisLines.js
//
// Crisis hotline data, taken verbatim from the crisis section that was
// duplicated across help.html, friend.html, family.html, romantic.html and
// otherHelp.html on main.
//
// All numbers below are copied exactly from the source HTML. Before this
// ships, someone on the team should verify each one is still current --
// these are the most safety-critical strings in the whole app.

const crisisLines = [
  {
    key: 'suicide-prevention',
    icon: '☎️',
    name: 'National Suicide Prevention Lifeline',
    description: 'Free and confidential support for people in distress',
    actions: [
      { label: '\u{1F4DE} Call or Text 988', href: 'tel:988', variant: 'btn-primary' },
    ],
  },
  {
    key: 'crisis-text-line',
    icon: '\u{1F4AC}',
    name: 'Crisis Text Line',
    description: 'Text with a trained crisis counselor',
    actions: [
      { label: '\u{1F4AC} Text HELLO to 741741', href: 'sms:741741&body=HELLO', variant: 'btn-primary' },
    ],
  },
  {
    key: 'domestic-violence',
    icon: '\u{1F3E0}',
    name: 'Domestic Violence Hotline',
    description: 'Support for domestic violence situations',
    actions: [
      { label: '\u{1F4DE} Call 1-800-799-7233', href: 'tel:18007997233', variant: 'btn-primary' },
    ],
  },
  {
    key: 'rainn',
    icon: '\u{1F464}',
    name: 'Sexual Assault Hotline (RAINN)',
    description: 'Confidential support from trained staff',
    actions: [
      { label: '\u{1F4DE} Call 1-800-656-4673', href: 'tel:18006564673', variant: 'btn-primary' },
    ],
  },
  {
    key: 'trevor-project',
    icon: '\u{1F3F3}️‍\u{1F308}',
    name: 'The Trevor Project',
    description: 'Crisis support for LGBTQ+ young people',
    actions: [
      { label: '\u{1F4DE} Call 1-866-488-7386', href: 'tel:18664887386', variant: 'btn-primary' },
      { label: '\u{1F4AC} Text START to 678678', href: 'sms:678678&body=START', variant: 'btn-light mt-sm' },
    ],
  },
];

export default crisisLines;
