import { getAccessToken } from '../auth/authClient.js'

const JOURNAL_ENDPOINT = '/.netlify/functions/journal'

// Use the browser's local date so entries change with the user's day, not server UTC.
function localDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Parse the shared JSON envelope and surface server errors to the page.
async function requestJournal(path, options = {}) {
  const accessToken = await getAccessToken()
  const response = await fetch(`${JOURNAL_ENDPOINT}${path}`, {
    credentials: 'same-origin',
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload.error || 'Journal storage is unavailable right now.')
  }

  return payload
}

// Read today's single journal row for the authenticated Identity user.
export async function getTodayEntry() {
  const date = localDateKey()
  const payload = await requestJournal(`?view=today&date=${date}`)
  return payload.entry || null
}

// Read a small, server-clamped history list newest first.
export async function getRecentEntries(limit = 10) {
  const payload = await requestJournal(`?view=recent&limit=${limit}`)
  return Array.isArray(payload.entries) ? payload.entries : []
}

// Save the complete state for today so content and mood use one consistent record.
export async function saveTodayEntry({ content = '', mood = null }) {
  const payload = await requestJournal('', {
    method: 'PUT',
    body: JSON.stringify({
      date: localDateKey(),
      content,
      mood,
    }),
  })
  return payload.entry
}

export { localDateKey }
