import { assistantTopics, storedResources } from '../../../src/content/resourceCatalog.js'

// Lowercase, drop punctuation, collapse spaces. The padding spaces let keywords
// like 'my ex' match at the very start or end of a sentence.
export function normalizeQuestion(text) {
  const cleaned = String(text || '')
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[^a-z0-9'\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return ` ${cleaned} `
}

// Which topics does the question touch? Most keyword hits first.
// A keyword must start a word, so 'friend' does not fire inside 'boyfriend'.
export function matchTopics(normalized) {
  return Object.entries(assistantTopics)
    .map(([topic, { keywords }]) => ({
      topic,
      hits: keywords.filter((keyword) => normalized.includes(` ${keyword}`)).length,
    }))
    .filter(({ hits }) => hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .map(({ topic }) => topic)
}

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'how', 'what', 'about', 'can', 'that', 'this',
  'when', 'she', 'they', 'you', 'your', 'are', 'was', 'have', 'from', 'but', 'not',
])

function words(text) {
  return normalizeQuestion(text)
    .trim()
    .split(' ')
    .filter((word) => word.length > 2 && STOP_WORDS.has(word) === false)
}

// Score each live, non-hotline resource: 3 points per shared topic, 1 per shared word.
export function rankStoredResources(normalized, topics, limit = 8) {
  const queryWords = new Set(words(normalized))
  return storedResources
    .filter((resource) => resource.available && resource.kind !== 'hotline')
    .map((resource) => {
      const topicScore = resource.topics.filter((topic) => topics.includes(topic)).length * 3
      const wordScore = words(`${resource.title} ${resource.summary}`).filter((word) => queryWords.has(word)).length
      return { resource, score: topicScore + wordScore }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ resource }) => resource)
}

// Hotlines join the candidates only when a matched topic (other than 'crisis') calls for one,
// e.g. 'abuse' brings in the domestic violence hotline.
export function relevantHotlines(topics) {
  return storedResources.filter(
    (resource) =>
      resource.kind === 'hotline' &&
      resource.topics.some((topic) => topic !== 'crisis' && topics.includes(topic)),
  )
}

// Crisis language (Step 3). If any pattern matches, the assistant skips the model
// and shows hotlines right away. \b means "a word starts here", so /\bsuicid/
// catches suicide and suicidal but nothing in the middle of another word.
const CRISIS_PATTERNS = [
  /\bsuicid/,
  /\bkill(ing)? myself\b/,
  /\bkms\b/,
  /\bunalive/,
  /\b(want to|wanna|going to|gonna) die\b/,
  /\b(don't|dont|do not) want to (live|be alive|be here)\b/,
  /\bno reason to live\b/,
  /\bbetter off dead\b/,
  /\bend (it all|my life)\b/,
  /\bself[- ]?harm/,
  /\b(cut|cutting|hurt|hurting|starve|starving) myself\b/,
  /\boverdos/,
  /\braped?\b/,
  /\bsexual(ly)? assault/,
  /\b(going to|gonna|will|wants to|threatened to) (hurt|kill) me\b/,
  /\b(i'm|i am|we're|we are|my life is) in danger\b/,
  /\bimmediate danger\b/,
]

// Hotlines for the crisis path, in the order they are shown.
const CRISIS_RESOURCE_IDS = ['crisis-988', 'crisis-text-line', 'crisis-dv-hotline', 'crisis-rainn', 'crisis-trevor']

export function detectCrisis(normalized) {
  return CRISIS_PATTERNS.some((pattern) => pattern.test(normalized))
}

export function crisisResources() {
  return CRISIS_RESOURCE_IDS
    .map((id) => storedResources.find((resource) => resource.id === id))
    .filter(Boolean)
}
