import { getUser, verifyRequestOrigin } from '@netlify/identity'
import { getStore } from '@netlify/blobs'
import { QuotaExceededError, readUsage, refundRequest, reserveRequest } from '../lib/assistant/quota.mjs'
import { fallbackRanking, MODEL, rankWithClaude } from '../lib/assistant/recommend.mjs'
import {
  crisisResources,
  detectCrisis,
  matchTopics,
  normalizeQuestion,
  rankStoredResources,
  relevantHotlines,
} from '../lib/assistant/retrieval.mjs'
import { buildLiteratureQuery, searchLiterature } from '../lib/assistant/scholarly.mjs'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const MAX_QUESTION_LENGTH = 500

// Latency budget: the whole request must finish under the 10s worst case.
const TOTAL_BUDGET_MS = 9000
const LITERATURE_TIMEOUT_MS = 2500
const MODEL_TIMEOUT_MS = 6000
const MIN_MODEL_WINDOW_MS = 1500
const LITERATURE_CACHE_MS = 24 * 60 * 60 * 1000

function json(payload, status = 200, headers = {}) {
  return Response.json(payload, { status, headers: { 'Cache-Control': 'no-store', ...headers } })
}

// Literature queries come from a small set of topic pairs, so results cache well.
async function cachedLiterature(query, context) {
  const cache = getStore('assistant-literature')
  try {
    const hit = await cache.get(query.key, { type: 'json' })
    if (hit && Date.now() - hit.at < LITERATURE_CACHE_MS) return { papers: hit.papers, cached: true }
  } catch (error) {
    console.warn('Literature cache read failed:', error.message)
  }

  const papers = await searchLiterature(query, LITERATURE_TIMEOUT_MS)
  if (papers.length) {
    const write = cache.setJSON(query.key, { at: Date.now(), papers }).catch((error) => {
      console.warn('Literature cache write failed:', error.message)
    })
    if (context?.waitUntil) context.waitUntil(write)
    else await write
  }
  return { papers, cached: false }
}

// Resolve one question into stored picks and peer-reviewed picks within the budget.
async function recommend(question, uuid, context, startedAt) {
  const normalized = normalizeQuestion(question)

  // Crisis language gets hotlines immediately, without the model and without using quota.
  if (detectCrisis(normalized)) {
    return {
      crisis: true,
      note: 'It sounds like you may be going through something serious. You deserve support right now. If you are in immediate danger, call 911.',
      stored: crisisResources().map((resource) => ({ ...resource, reason: resource.summary })),
      papers: [],
      usage: await readUsage(uuid),
    }
  }

  const usage = await reserveRequest(uuid)
  try {
    return await answer(question, normalized, uuid, usage, context, startedAt)
  } catch (error) {
    await refundRequest(uuid).catch(() => {})
    throw error
  }
}

// Runs after the quota reservation; recommend() refunds it if this throws.
async function answer(question, normalized, uuid, usage, context, startedAt) {
  const topics = matchTopics(normalized)
  const stored = [...relevantHotlines(topics), ...rankStoredResources(normalized, topics)]
  const { papers, cached } = await cachedLiterature(buildLiteratureQuery(topics), context)

  const modelWindow = Math.min(MODEL_TIMEOUT_MS, TOTAL_BUDGET_MS - (Date.now() - startedAt))
  let result
  let degraded = false

  if (modelWindow >= MIN_MODEL_WINDOW_MS && (stored.length || papers.length)) {
    try {
      result = await rankWithClaude({ question, stored, papers, timeoutMs: modelWindow })
    } catch (error) {
      console.warn('Assistant model call failed:', error?.name, error?.message)
    }
  }

  if (!result) {
    degraded = true
    result = fallbackRanking({ stored, papers })
  }

  // A degraded answer did not use the model, so it does not count against the user.
  const finalUsage = degraded ? await refundRequest(uuid) : usage

  console.log('assistant', JSON.stringify({
    ms: Date.now() - startedAt,
    topics,
    stored: stored.length,
    papers: papers.length,
    literatureCached: cached,
    degraded,
    model: degraded ? null : MODEL,
    tokens: result.usage || null,
  }))

  return {
    crisis: false,
    degraded,
    note: result.note,
    stored: result.stored.map(({ id, title, href, kind, reason }) => ({ id, title, href, kind, reason })),
    papers: result.papers.map(({ title, venue, year, authors, url, reason }) => ({ title, venue, year, authors, url, reason })),
    usage: finalUsage,
  }
}

export default async (request, context) => {
  const startedAt = Date.now()
  try {
    const user = await getUser()
    if (!user) return json({ error: 'Please log in to use the assistant.' }, 401)
    if (!UUID_PATTERN.test(user.id)) return json({ error: 'Your session has an invalid user ID.' }, 400)
    const uuid = user.id.toLowerCase()

    if (request.method === 'GET') return json({ usage: await readUsage(uuid) })
    if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, { Allow: 'GET, POST' })

    verifyRequestOrigin(request)
    const body = await request.json()
    const question = typeof body?.question === 'string' ? body.question.trim() : ''
    if (!question) return json({ error: 'Type a question first.' }, 400)
    if (question.length > MAX_QUESTION_LENGTH) {
      return json({ error: `Questions must be ${MAX_QUESTION_LENGTH} characters or fewer.` }, 400)
    }

    return json(await recommend(question, uuid, context, startedAt))
  } catch (error) {
    if (error instanceof QuotaExceededError) {
      return json({ error: 'You have used all of today’s assistant requests. They reset at midnight UTC.' }, 429)
    }
    if (error instanceof SyntaxError) return json({ error: 'A JSON body is required.' }, 400)
    if (Number(error?.status) >= 400 && Number(error?.status) < 500) {
      return json({ error: 'This request was not allowed.' }, Number(error.status))
    }
    console.error('Assistant function failed:', error?.message)
    return json({ error: 'The assistant is unavailable right now. Please try again.' }, 500)
  }
}
