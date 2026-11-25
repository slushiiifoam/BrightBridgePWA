import { getAccessToken } from '../auth/authClient.js'

const ASSISTANT_ENDPOINT = '/.netlify/functions/assistant'

// Send one authenticated request and surface the server's error text to the page.
async function requestAssistant(options = {}) {
  const accessToken = await getAccessToken()
  const response = await fetch(ASSISTANT_ENDPOINT, {
    credentials: 'same-origin',
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(payload.error || 'The assistant is unavailable right now.')
    error.status = response.status
    throw error
  }
  return payload
}

// Read how many of today's requests remain without spending one.
export async function getAssistantUsage() {
  const payload = await requestAssistant()
  return payload.usage
}

export async function askAssistant(question) {
  return requestAssistant({ method: 'POST', body: JSON.stringify({ question }) })
}
