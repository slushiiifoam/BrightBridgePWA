import { getUser, verifyRequestOrigin } from '@netlify/identity'
import { createClient } from '@supabase/supabase-js'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const ALLOWED_MOODS = new Set(['happy', 'neutral', 'sad'])
const MAX_ENTRY_LENGTH = 10000

let database

class ConfigurationError extends Error {}

// Create one server-side client using the prototype's publishable Supabase key.
function getDatabase() {
  if (database) return database

  const url = process.env.SUPABASE_URL
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY
  if (!url || !publishableKey) {
    throw new ConfigurationError('Journal storage is not configured on this deploy.')
  }

  // Prototype configuration: database RLS must protect direct publishable-key access.
  database = createClient(url, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return database
}

// Send every API response as uncached JSON because journal data is private.
function json(payload, status = 200, headers = {}) {
  return Response.json(payload, {
    status,
    headers: { 'Cache-Control': 'no-store', ...headers },
  })
}

// Accept strict calendar dates and reject values Date.parse would loosely coerce.
function normalizeDate(value) {
  const date = String(value || '')
  if (!DATE_PATTERN.test(date)) return null

  const parsed = new Date(`${date}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) return null
  return date
}

// Translate the three UI moods to the existing two-bit/null database format.
function moodToDatabase(mood) {
  if (mood === 'happy') return '01'
  if (mood === 'sad') return '00'
  return null
}

// Read both legacy boolean/bit variants without changing historical rows.
function databaseToMood(value) {
  if (value === null || value === undefined) return 'neutral'
  if ([true, 1, '1', '01', '11', 't', 'true'].includes(value)) return 'happy'
  if ([false, 0, '0', '00', '10', 'f', 'false'].includes(value)) return 'sad'
  return 'neutral'
}

// Return only fields the React pages need; never send a user UUID back to the browser.
function mapEntry(row) {
  if (!row) return null
  return {
    content: row.entry || '',
    date: row.created_date,
    mood: databaseToMood(row.overall_emotion),
  }
}

// Preserve the legacy read-then-insert/update behavior instead of an unconditional profile upsert.
async function ensureProfile(client, user) {
  const uuid = user.id.toLowerCase()
  const email = String(user.email || '').trim().toLowerCase()

  const { data: existing, error: readError } = await client
    .from('users')
    .select('uuid,email')
    .eq('uuid', uuid)
    .maybeSingle()

  if (readError) throw readError

  if (existing) {
    if (!email || String(existing.email || '').trim().toLowerCase() === email) return existing

    const { error: updateError } = await client
      .from('users')
      .update({ email })
      .eq('uuid', uuid)

    if (updateError) throw updateError
    return { ...existing, email }
  }

  if (!email) throw new TypeError('Your Identity profile does not include an email address.')

  const { error: insertError } = await client
    .from('users')
    .insert({ uuid, email })

  if (!insertError) return { uuid, email }

  // Another request may have created the same profile between the read and insert.
  if (String(insertError.code || '') === '23505') {
    const { data: racedProfile, error: racedReadError } = await client
      .from('users')
      .select('uuid,email')
      .eq('uuid', uuid)
      .maybeSingle()

    if (racedReadError) throw racedReadError
    if (racedProfile) return racedProfile
  }

  throw insertError
}

// Load the authenticated user's entry for one local calendar date.
async function readToday(client, uuid, date) {
  const { data, error } = await client
    .from('journal_entry')
    .select('created_date,overall_emotion,entry')
    .eq('uuid', uuid)
    .eq('created_date', date)
    .maybeSingle()

  if (error) throw error
  return mapEntry(data)
}

// Clamp history requests to ten entries to keep the response small.
async function readRecent(client, uuid, requestedLimit) {
  const limit = Math.min(Math.max(Math.trunc(Number(requestedLimit)) || 10, 1), 10)
  const { data, error } = await client
    .from('journal_entry')
    .select('created_date,overall_emotion,entry')
    .eq('uuid', uuid)
    .order('created_date', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data || []).map(mapEntry)
}

// Validate and upsert one complete daily journal state.
async function saveToday(client, uuid, body) {
  const date = normalizeDate(body.date)
  const content = typeof body.content === 'string' ? body.content.trim() : null
  const mood = body.mood === null ? null : String(body.mood || '')

  if (!date) throw new TypeError('A valid journal date is required.')
  if (content === null) throw new TypeError('Journal content must be text.')
  if (content.length > MAX_ENTRY_LENGTH) {
    throw new TypeError(`Journal entries must be ${MAX_ENTRY_LENGTH.toLocaleString()} characters or fewer.`)
  }
  if (mood !== null && !ALLOWED_MOODS.has(mood)) {
    throw new TypeError('Choose a valid mood before saving.')
  }
  if (!content && !mood) throw new TypeError('Add a mood or journal note before saving.')

  const { data, error } = await client
    .from('journal_entry')
    .upsert(
      {
        uuid,
        created_date: date,
        entry: content || null,
        overall_emotion: moodToDatabase(mood),
      },
      { onConflict: 'uuid,created_date' },
    )
    .select('created_date,overall_emotion,entry')
    .maybeSingle()

  if (error) throw error
  return mapEntry(data)
}

// Serve all journal operations from one authenticated, same-origin endpoint.
export default async (request) => {
  try {
    const user = await getUser()
    if (!user) return json({ error: 'Please log in to use your journal.' }, 401)
    if (!UUID_PATTERN.test(user.id)) return json({ error: 'Your session has an invalid user ID.' }, 400)

    if (request.method !== 'GET' && request.method !== 'PUT') {
      return json({ error: 'Method not allowed.' }, 405, { Allow: 'GET, PUT' })
    }

    if (request.method === 'PUT') verifyRequestOrigin(request)

    const client = getDatabase()
    const uuid = user.id.toLowerCase()

    if (request.method === 'GET') {
      const url = new URL(request.url)
      const view = url.searchParams.get('view') || 'recent'

      if (view === 'today') {
        const date = normalizeDate(url.searchParams.get('date'))
        if (!date) return json({ error: 'A valid journal date is required.' }, 400)
        return json({ entry: await readToday(client, uuid, date) })
      }

      if (view === 'recent') {
        return json({ entries: await readRecent(client, uuid, url.searchParams.get('limit')) })
      }

      return json({ error: 'Unknown journal view.' }, 400)
    }

    if (request.method === 'PUT') {
      const body = await request.json()
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return json({ error: 'A JSON object is required.' }, 400)
      }
      await ensureProfile(client, user)
      return json({ entry: await saveToday(client, uuid, body) })
    }
  } catch (error) {
    if (error instanceof ConfigurationError) {
      console.error(error.message)
      return json({ error: error.message }, 503)
    }
    if (error instanceof TypeError || error instanceof SyntaxError) {
      return json({ error: error.message || 'Invalid request.' }, 400)
    }
    if (Number(error?.status) >= 400 && Number(error?.status) < 500) {
      return json({ error: 'This request was not allowed.' }, Number(error.status))
    }

    if (['42P10', '42501'].includes(String(error?.code || ''))) {
      console.error('Journal database configuration failed:', {
        code: error.code,
        message: error.message,
        hint: error.hint,
      })
      return json({ error: 'Journal database permissions or indexes are not configured for this deploy.' }, 503)
    }

    console.error('Journal function failed:', {
      code: error?.code,
      message: error?.message,
      hint: error?.hint,
    })
    return json({ error: 'Journal storage is unavailable right now. Please try again.' }, 500)
  }
}
