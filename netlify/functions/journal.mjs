import { getUser, verifyRequestOrigin } from '@netlify/identity'
import { createClient } from '@supabase/supabase-js'

const LEGACY_SUPABASE_URL = 'https://pyqznelkiujkmviedlha.supabase.co'
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const ALLOWED_MOODS = new Set(['happy', 'neutral', 'sad'])
const MAX_ENTRY_LENGTH = 10000

let database

class ConfigurationError extends Error {}

// Keep the privileged Supabase key on the server; never expose it through a VITE_ variable.
function getDatabase() {
  if (database) return database

  const url = process.env.SUPABASE_URL || LEGACY_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new ConfigurationError('Journal storage is not configured on this deploy.')
  }

  database = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return database
}

// Send every API response as uncached JSON because journal data is private.
function json(payload, status = 200) {
  return Response.json(payload, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })
}

// Accept strict calendar dates and reject values Date.parse would loosely coerce.
function normalizeDate(value) {
  const date = String(value || '')
  if (!DATE_PATTERN.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
    return null
  }
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

// Ensure the journal foreign-key profile exists for the verified Identity account.
async function ensureProfile(client, user) {
  const email = String(user.email || '').trim().toLowerCase()
  if (!email) throw new Error('Your Identity profile does not include an email address.')

  const { error } = await client
    .from('users')
    .upsert({ uuid: user.id.toLowerCase(), email }, { onConflict: 'uuid' })

  if (error) throw error
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
  const limit = Math.min(Math.max(Number(requestedLimit) || 10, 1), 10)
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

    const client = getDatabase()
    await ensureProfile(client, user)
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
      verifyRequestOrigin(request)
      const body = await request.json()
      return json({ entry: await saveToday(client, uuid, body) })
    }

    return json({ error: 'Method not allowed.' }, 405)
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

    console.error('Journal function failed:', error)
    return json({ error: 'Journal storage is unavailable right now. Please try again.' }, 500)
  }
}
