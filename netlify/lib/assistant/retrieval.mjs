import { assistantTopics, storedResources } from '../../../src/content/resourceCatalog.js'

// Lowercase, drop punctuation, collapse spaces. The padding spaces let keywords
// like 'my ex' match at the very start or end of a sentence.
export function normalizeQuestion(text) {
  const cleaned = String(text || '')
    .toLowerCase()
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
