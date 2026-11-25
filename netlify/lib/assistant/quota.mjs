import { getStore } from '@netlify/blobs'

export const DAILY_LIMIT = Number(process.env.ASSISTANT_DAILY_LIMIT) || 5
const MAX_ATTEMPTS = 8

export class QuotaExceededError extends Error {}

let store

function usageStore() {
  store ||= getStore({ name: 'assistant-usage', consistency: 'strong' })
  return store
}

// Quotas reset at midnight UTC; the key keeps each user-day in its own blob.
function usageKey(uuid, now = new Date()) {
  return `${now.toISOString().slice(0, 10)}/${uuid}`
}

export async function readUsage(uuid) {
  const entry = await usageStore().get(usageKey(uuid), { type: 'json' })
  const used = Number(entry?.count) || 0
  return { used, remaining: Math.max(DAILY_LIMIT - used, 0), limit: DAILY_LIMIT }
}

// Compare-and-swap on the blob ETag so two tabs cannot both spend the last request.
async function adjust(uuid, delta) {
  const key = usageKey(uuid)
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const current = await usageStore().getWithMetadata(key, { type: 'json' })
    const count = Number(current?.data?.count) || 0
    const next = count + delta

    if (delta > 0 && next > DAILY_LIMIT) throw new QuotaExceededError('Daily limit reached.')
    if (next < 0) return { used: 0, remaining: DAILY_LIMIT, limit: DAILY_LIMIT }

    const { modified } = await usageStore().setJSON(
      key,
      { count: next },
      current ? { onlyIfMatch: current.etag } : { onlyIfNew: true },
    )
    if (modified) return { used: next, remaining: DAILY_LIMIT - next, limit: DAILY_LIMIT }

    // Another write won the race; back off with jitter before re-reading.
    await new Promise((resolve) => setTimeout(resolve, 10 + Math.random() * 40 * (attempt + 1)))
  }
  throw new Error('Could not update assistant usage after concurrent writes.')
}

export const reserveRequest = (uuid) => adjust(uuid, 1)
export const refundRequest = (uuid) => adjust(uuid, -1)
