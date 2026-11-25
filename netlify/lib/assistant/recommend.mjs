import Anthropic from '@anthropic-ai/sdk'

export const MODEL = process.env.ASSISTANT_MODEL || 'claude-opus-5-5'
const MAX_PICKS = 3

const SYSTEM_PROMPT = `You recommend resources inside BrightBridge, a relationship-support app for teens and young adults.

You receive a user's question, a list of BrightBridge resources, and a list of peer-reviewed articles. Choose up to ${MAX_PICKS} BrightBridge resources and up to ${MAX_PICKS} articles that would genuinely help with the question, best first. Use only ids from the lists; never invent resources, links, or phone numbers. Choose fewer, or none, when nothing fits.

For each pick write one plain sentence (under 25 words) addressed to the user, saying why it helps with their situation. Articles are research, so describe what the study looked at rather than giving advice from it. Write "note" as one warm sentence that acknowledges their situation; do not diagnose or give medical or legal advice. If the question suggests anyone may be unsafe, include a hotline from the BrightBridge list and say so in the note.`

const OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['note', 'stored', 'papers'],
  properties: {
    note: { type: 'string' },
    stored: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'reason'],
        properties: { id: { type: 'string' }, reason: { type: 'string' } },
      },
    },
    papers: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'reason'],
        properties: { id: { type: 'string' }, reason: { type: 'string' } },
      },
    },
  },
}

let client

function getClient() {
  // Retries would blow the latency budget; the caller falls back instead.
  client ||= new Anthropic({ maxRetries: 0 })
  return client
}

// Keep only picks whose ids exist so every link comes from our own data.
function resolvePicks(picks, candidates) {
  const byId = new Map(candidates.map((candidate) => [candidate.id, candidate]))
  const seen = new Set()
  return (Array.isArray(picks) ? picks : [])
    .filter((pick) => byId.has(pick?.id) && !seen.has(pick.id) && seen.add(pick.id))
    .slice(0, MAX_PICKS)
    .map((pick) => ({ ...byId.get(pick.id), reason: String(pick.reason || '').slice(0, 300) }))
}

// One structured-output call ranks and explains candidates retrieval already found.
export async function rankWithClaude({ question, stored, papers, timeoutMs }) {
  const response = await getClient().beta.messages.create(
    {
      model: MODEL,
      max_tokens: 2048,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: {
        effort: 'low',
        format: { type: 'json_schema', schema: OUTPUT_SCHEMA },
      },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: JSON.stringify({
            question,
            brightbridge_resources: stored.map(({ id, title, summary }) => ({ id, title, summary })),
            articles: papers.map(({ id, title, venue, year }) => ({ id, title, journal: venue, year })),
          }),
        },
      ],
    },
    { timeout: timeoutMs },
  )

  if (response.stop_reason === 'refusal') throw new Error('The model declined this request.')
  const text = response.content.find((block) => block.type === 'text')?.text
  const parsed = JSON.parse(text || '{}')

  return {
    note: String(parsed.note || '').slice(0, 400),
    stored: resolvePicks(parsed.stored, stored),
    papers: resolvePicks(parsed.papers, papers),
    usage: { input: response.usage.input_tokens, output: response.usage.output_tokens },
  }
}

// Deterministic answer used when the model is slow, down, or declines.
export function fallbackRanking({ stored, papers }) {
  return {
    note: 'Here are some resources that match what you described.',
    stored: stored.slice(0, MAX_PICKS).map((resource) => ({ ...resource, reason: resource.summary })),
    papers: papers
      .slice()
      .sort((a, b) => b.citedBy - a.citedBy)
      .slice(0, MAX_PICKS)
      .map((paper) => ({ ...paper, reason: `Peer-reviewed research${paper.venue ? ` in ${paper.venue}` : ''}.` })),
  }
}