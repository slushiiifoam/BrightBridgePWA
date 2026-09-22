import {
  acceptInvite,
  getUser,
  handleAuthCallback,
  login,
  logout,
  oauthLogin,
  onAuthChange,
  requestPasswordRecovery,
  signup,
  updateUser,
} from '@netlify/identity'

let callbackPromise

// Process an Identity redirect once, even when React Strict Mode mounts twice in development.
export function processAuthCallback() {
  callbackPromise ??= handleAuthCallback()
  return callbackPromise
}

// Restore the SDK-managed cookie/local session without copying JWTs into app storage.
export function loadCurrentUser() {
  return getUser()
}

// Keep every auth event (including cross-tab logout and token refresh) in one place.
export function subscribeToAuthChanges(callback) {
  return onAuthChange(callback)
}

// Start the Google OAuth redirect using Netlify's supported headless SDK.
export function loginWithGoogle() {
  try {
    oauthLogin('google')
  } catch (error) {
    // Version 2 signals a successful browser redirect by throwing after assigning location.
    if (!String(error?.message || '').includes('Redirecting to OAuth provider')) {
      throw error
    }
  }
}

// Log in with the email/password option formerly supplied by the old widget.
export function loginWithEmail(email, password) {
  return login(email, password)
}

// Create an email/password account and include a friendly display name when provided.
export function signUpWithEmail(email, password, displayName = '') {
  const name = displayName.trim()
  return signup(email, password, name ? { full_name: name } : undefined)
}

// Ask Netlify Identity to email a secure password-recovery link.
export function sendPasswordRecovery(email) {
  return requestPasswordRecovery(email)
}

// Finish a recovery callback after the user chooses a replacement password.
export function updatePassword(password) {
  return updateUser({ password })
}

// Finish an Identity invite callback by setting the invited account's password.
export function acceptIdentityInvite(token, password) {
  return acceptInvite(token, password)
}

// Await the server logout so protected pages never race a still-valid session cookie.
export function signOut() {
  return logout()
}

// Store onboarding state on the Identity profile so it follows the correct account.
export function markOnboardingComplete(user) {
  return updateUser({
    data: {
      ...(user?.userMetadata || {}),
      brightbridge_onboarded: true,
    },
  })
}

// Prefer normalized SDK fields and fall back to the email prefix for a friendly greeting.
export function getDisplayName(user) {
  const metadata = user?.userMetadata || {}
  const candidates = [user?.name, metadata.full_name, metadata.name]

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  if (typeof user?.email === 'string' && user.email.trim()) {
    return user.email.split('@')[0]
  }

  return 'User'
}

export function hasCompletedOnboarding(user) {
  return user?.userMetadata?.brightbridge_onboarded === true
}
