// Shared identity display-name resolver for asset pages.
(function (global) {
  // JWT payloads are a reliable fallback when provider metadata is incomplete (common on Safari first load).
  function decodeJwtClaims(tokenValue) {
    if (!tokenValue || typeof tokenValue !== 'string') {
      return {};
    }

    const parts = tokenValue.split('.');
    if (parts.length < 2) {
      return {};
    }

    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padding = '='.repeat((4 - (base64.length % 4)) % 4);
      return JSON.parse(atob(base64 + padding));
    } catch (error) {
      return {};
    }
  }

  // Prefer the first non-empty candidate and normalize emails to the part before '@'.
  function pickDisplayName(candidates) {
    for (const value of candidates) {
      const trimmed = (value || '').trim();
      if (!trimmed) {
        continue;
      }

      return trimmed.includes('@') ? trimmed.split('@')[0] : trimmed;
    }

    return '';
  }

  // Resolve name from multiple identity surfaces because each browser/provider can populate different fields.
  function resolveDisplayNameFromUser(user) {
    if (!user) {
      return '';
    }

    const meta = user.user_metadata || {};
    const token = user.token || {};
    const tokenMeta = token.user_metadata || {};
    const claims = decodeJwtClaims(token.access_token || token.id_token || '');
    const claimMeta = claims.user_metadata || {};

    return pickDisplayName([
      meta.full_name,
      meta.name,
      tokenMeta.full_name,
      tokenMeta.name,
      claimMeta.full_name,
      claimMeta.name,
      claims.name,
      user.email,
      token.email,
      claims.email
    ]);
  }

  // Recover from the persisted auth snapshot when in-memory Netlify Identity data is temporarily sparse.
  function resolveDisplayNameFromStoredUser() {
    try {
      const raw = localStorage.getItem('brightbridge.user');
      if (!raw) {
        return '';
      }

      const parsed = JSON.parse(raw);
      return resolveDisplayNameFromUser(parsed);
    } catch (error) {
      return '';
    }
  }

  // Ignore placeholder values so callers can distinguish "real name" from fallback text.
  function getCachedDisplayName() {
    const cached = (localStorage.getItem('brightbridge_username') || '').trim();
    if (!cached || cached.toLowerCase() === 'user') {
      return '';
    }

    return cached;
  }

  // Single write path for the display name keeps all pages consistent once a better value is found.
  function syncStoredDisplayName(user) {
    const resolved = resolveDisplayNameFromUser(user) || resolveDisplayNameFromStoredUser();
    if (resolved) {
      localStorage.setItem('brightbridge_username', resolved);
    }

    return resolved;
  }

  global.IdentityDisplayName = {
    decodeJwtClaims,
    resolveDisplayNameFromUser,
    resolveDisplayNameFromStoredUser,
    getCachedDisplayName,
    syncStoredDisplayName
  };
})(window);
