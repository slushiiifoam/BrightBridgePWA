// Run with: npm test
// Exercises the assistant function end to end with in-memory Blobs, a fake Identity user,
// and a fetch stub standing in for Europe PMC, OpenAlex, and the Claude API.
import assert from 'node:assert/strict'
import { afterEach, beforeEach, mock, test } from 'node:test'

const USER_ID = '6f1c1d2e-3b4a-4c5d-8e9f-0a1b2c3d4e5f'
const blobs = new Map()
let etagCounter = 0

function memoryStore(name) {
  const keyOf = (key) => `${name}:${key}`
  return {
    async get(key) {
      const entry = blobs.get(keyOf(key))
      return entry ? structuredClone(entry.data) : null
    },
    async getWithMetadata(key) {
      const entry = blobs.get(keyOf(key))
      return entry ? { data: structuredClone(entry.data), etag: entry.etag, metadata: {} } : null
    },
    async setJSON(key, data, options = {}) {
      // Yield so concurrent requests interleave like real network calls.
      await new Promise((resolve) => setTimeout(resolve, 1))
      const current = blobs.get(keyOf(key))
      if (options.onlyIfNew && current) return { modified: false }
      if (options.onlyIfMatch && current?.etag !== options.onlyIfMatch) return { modified: false }
      const etag = `e${(etagCounter += 1)}`
      blobs.set(keyOf(key), { data: structuredClone(data), etag })
      return { modified: true, etag }
    },
  }
}

mock.module('@netlify/blobs', {
  namedExports: { getStore: (options) => memoryStore(typeof options === 'string' ? options : options.name) },
})
mock.module('@netlify/identity', {
  namedExports: {
    getUser: async () => ({ id: USER_ID, email: 'test@example.com' }),
    verifyRequestOrigin: () => {},
  },
})

process.env.ANTHROPIC_API_KEY = 'test-key'
const { default: handler } = await import('../../functions/assistant.mjs')

let modelReply
let modelDelayMs
let literatureDelayMs
let modelCalls

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(signal.reason || new DOMException('Aborted', 'AbortError'))
    })
  })
}

async function fakeFetch(input, init = {}) {
  const url = String(input instanceof Request ? input.url : input)
  const signal = init.signal || (input instanceof Request ? input.signal : undefined)

  if (url.includes('europepmc')) {
    await wait(literatureDelayMs, signal)
    return Response.json({
      resultList: {
        result: [
          { id: '1', source: 'MED', title: 'Conflict resolution among adolescent friends', journalTitle: 'J Adolesc', pubYear: '2020', doi: '10.1/abc', citedByCount: 40 },
          { id: '2', source: 'MED', title: 'Peer relationships and coping', journalTitle: 'Child Dev', pubYear: '2018', citedByCount: 90 },
        ],
      },
    })
  }
  if (url.includes('openalex')) {
    await wait(literatureDelayMs, signal)
    return Response.json({
      results: [
        { id: 'https://openalex.org/W1', doi: 'https://doi.org/10.1/ABC', title: 'Duplicate of the first study', publication_year: 2020, cited_by_count: 40 },
        { id: 'https://openalex.org/W2', doi: 'https://doi.org/10.2/xyz', title: 'Friendship quality in adolescence', publication_year: 2021, primary_location: { source: { display_name: 'Dev Psych' } }, cited_by_count: 12 },
      ],
    })
  }
  if (url.includes('api.anthropic.com')) {
    modelCalls += 1
    await wait(modelDelayMs, signal)
    return Response.json({
      id: 'msg_test',
      type: 'message',
      role: 'assistant',
      model: 'test',
      content: [{ type: 'text', text: JSON.stringify(modelReply) }],
      stop_reason: 'end_turn',
      usage: { input_tokens: 900, output_tokens: 150 },
    })
  }
  throw new Error(`Unexpected fetch: ${url}`)
}

function ask(question) {
  return handler(
    new Request('https://example.test/.netlify/functions/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    }),
    {},
  )
}

beforeEach(() => {
  blobs.clear()
  modelCalls = 0
  modelDelayMs = 50
  literatureDelayMs = 20
  modelReply = {
    note: 'Fighting with a close friend is hard.',
    stored: [{ id: 'help-friend', reason: 'Tips for working things out with friends.' }, { id: 'made-up', reason: 'x' }],
    papers: [{ id: 'p3', reason: 'Studied how friendship quality changes.' }, { id: 'p99', reason: 'x' }],
  }
  mock.method(globalThis, 'fetch', fakeFetch)
})

afterEach(() => mock.restoreAll())

test('returns only picks that exist in our candidates and spends one request', async () => {
  const response = await ask('My friend and I keep fighting over small things')
  assert.equal(response.status, 200)
  const body = await response.json()

  assert.equal(body.degraded, false)
  assert.deepEqual(body.stored.map((item) => item.id), ['help-friend'])
  assert.equal(body.stored[0].href, '/help/relationships/friend')
  assert.deepEqual(body.papers.map((paper) => paper.title), ['Friendship quality in adolescence'])
  assert.deepEqual(body.usage, { used: 1, remaining: 4, limit: 5 })
})

test('never sends the user text to the literature APIs', async () => {
  await ask('My friend Jordan Smith keeps fighting with me')
  const literatureUrls = globalThis.fetch.mock.calls
    .map((call) => String(call.arguments[0]))
    .filter((url) => !url.includes('anthropic'))
  assert.ok(literatureUrls.length > 0)
  for (const url of literatureUrls) assert.ok(!decodeURIComponent(url).toLowerCase().includes('jordan'))
})

test('crisis language returns hotlines without the model or the quota', async () => {
  const body = await (await ask('I want to kill myself')).json()
  assert.equal(body.crisis, true)
  assert.equal(body.stored[0].id, 'crisis-988')
  assert.equal(modelCalls, 0)
  assert.equal(body.usage.remaining, 5)
})

test('the sixth request of the day is refused', async () => {
  for (let i = 0; i < 5; i += 1) assert.equal((await ask('how do I set boundaries with my mom')).status, 200)
  const response = await ask('how do I set boundaries with my mom')
  assert.equal(response.status, 429)
})

test('concurrent requests cannot exceed the daily limit', async () => {
  const statuses = await Promise.all(Array.from({ length: 8 }, () => ask('jealous boyfriend').then((r) => r.status)))
  assert.equal(statuses.filter((status) => status === 200).length, 5)
  assert.equal(statuses.filter((status) => status === 429).length, 3)
})

test('slow literature and a hung model still answer under 10 seconds, degraded and refunded', { timeout: 15000 }, async () => {
  literatureDelayMs = 60000
  modelDelayMs = 60000
  const started = Date.now()
  const body = await (await ask('my parents argue with me all the time')).json()
  const elapsed = Date.now() - started

  assert.ok(elapsed < 10000, `took ${elapsed}ms`)
  assert.equal(body.degraded, true)
  assert.ok(body.stored.length > 0)
  assert.equal(body.usage.remaining, 5)
})
