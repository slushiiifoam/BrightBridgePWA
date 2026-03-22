// Shared identity name helper used across login and dashboard pages.
// Centralizing this logic keeps Netlify field fallbacks consistent.
(function (global) {
  const STORAGE_KEY = 'brightbridge_username';
  const PLACEHOLDER = 'user';

  function normalizeDisplayName(value) {
    if (!value || typeof value !== 'string') {
      return '';
    }

    const cleaned = value.trim();
    if (!cleaned) {
      return '';
    }

    return cleaned.includes('@') ? cleaned.split('@')[0] : cleaned;
  }

  function readStoredDisplayName() {
    try {
      const stored = (localStorage.getItem(STORAGE_KEY) || '').trim();
      if (!stored || stored.toLowerCase() === PLACEHOLDER) {
        return '';
      }

      return stored;
    } catch (error) {
      return '';
    }
  }

  function resolveDisplayName(user) {
    if (!user) {
      return '';
    }

    const metadata = user.user_metadata || {};
    const profile = user.profile || {};
    const token = user.token || {};
    const tokenUserMetadata = token.user_metadata || {};
    const identities = Array.isArray(user.identities) ? user.identities : [];
    const identityCandidates = identities.flatMap(identity => {
      const data = identity && identity.identity_data ? identity.identity_data : {};
      return [data.full_name, data.name, data.email];
    });

    // Candidate order prefers explicit profile names before email fallback.
    const candidates = [
      metadata.full_name,
      metadata.name,
      metadata.fullName,
      tokenUserMetadata.full_name,
      tokenUserMetadata.name,
      profile.full_name,
      profile.name,
      user.email,
      token.email,
      profile.email,
      ...identityCandidates
    ];

    for (const candidate of candidates) {
      const resolved = normalizeDisplayName(candidate);
      if (resolved && resolved.toLowerCase() !== PLACEHOLDER) {
        return resolved;
      }
    }

    return '';
  }

  function syncStoredDisplayName(user) {
    const resolved = resolveDisplayName(user);
    if (!resolved) {
      return '';
    }

    try {
      localStorage.setItem(STORAGE_KEY, resolved);
    } catch (error) {
      // Ignore storage errors and still return resolved for direct UI use.
    }

    return resolved;
  }

  global.IdentityDisplayName = {
    resolveDisplayName,
    readStoredDisplayName,
    syncStoredDisplayName
  };
})(window);