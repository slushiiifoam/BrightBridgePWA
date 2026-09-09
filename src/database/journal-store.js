(function (global) {
  let lastErrorMessage = '';

  function setLastError(message) {
    lastErrorMessage = message ? String(message) : '';
  }

  function normalizeUuid(value) {
    const uuid = String(value || '').trim().toLowerCase();
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidPattern.test(uuid) ? uuid : null;
  }

  function decodeJwtPayload(token) {
    try {
      const parts = String(token || '').split('.');
      if (parts.length < 2) {
        return null;
      }

      const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
      const json = atob(padded);
      return JSON.parse(json);
    } catch (error) {
      return null;
    }
  }

  function getUserFromStorage() {
    const raw = localStorage.getItem('brightbridge.user');
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function getActiveIdentityUser() {
    if (global.netlifyIdentity && typeof global.netlifyIdentity.currentUser === 'function') {
      try {
        const currentUser = global.netlifyIdentity.currentUser();
        if (currentUser) {
          return currentUser;
        }
      } catch (error) {
        // Ignore runtime widget errors and fallback to storage.
      }
    }

    return getUserFromStorage();
  }

  function uuidFromUser(user) {
    if (!user) {
      return null;
    }

    const directUuid = normalizeUuid(user.id);
    if (directUuid) {
      return directUuid;
    }

    const token = user && user.token ? (user.token.access_token || user.token.id_token) : null;
    const payload = decodeJwtPayload(token);
    if (payload && payload.sub) {
      return normalizeUuid(payload.sub);
    }

    return null;
  }

  function emailFromUser(user) {
    if (!user) {
      return null;
    }

    if (user.email) {
      return String(user.email).trim().toLowerCase();
    }

    const token = user && user.token ? (user.token.access_token || user.token.id_token) : null;
    const payload = decodeJwtPayload(token);
    if (payload && payload.email) {
      return String(payload.email).trim().toLowerCase();
    }

    return null;
  }

  function toDateLabel(dateValue) {
    if (!dateValue) {
      return '';
    }

    const date = new Date(`${dateValue}T00:00:00`);
    return date.toLocaleDateString();
  }

  function moodToBit(mood) {
    if (mood === 'happy') {
      return '01';
    }

    if (mood === 'sad') {
      return '00';
    }

    return null;
  }

  function bitToMood(value) {
    if (value === null || value === undefined) {
      return 'neutral';
    }

    if (value === true || value === 1 || value === '1' || value === '01' || value === '11' || value === 't' || value === 'true') {
      return 'happy';
    }

    if (value === false || value === 0 || value === '0' || value === '00' || value === '10' || value === 'f' || value === 'false') {
      return 'sad';
    }

    return 'neutral';
  }

  function mapRowToEntry(row, userKey) {
    if (!row) {
      return null;
    }

    return {
      userKey,
      content: row.entry || '',
      mood: bitToMood(row.overall_emotion),
      timestamp: row.created_date ? `${row.created_date}T00:00:00.000Z` : null,
      date: toDateLabel(row.created_date)
    };
  }

  async function resolveDbIdentity(userOrKey) {
    setLastError('');

    if (typeof userOrKey === 'string' && userOrKey.trim()) {
      const directUuid = normalizeUuid(userOrKey);
      if (directUuid) {
        const sessionUser = getActiveIdentityUser();
        return { uuid: directUuid, email: emailFromUser(sessionUser) };
      }
    }

    if (userOrKey && typeof userOrKey === 'object') {
      const objectUuid = uuidFromUser(userOrKey);
      if (objectUuid) {
        return { uuid: objectUuid, email: emailFromUser(userOrKey) };
      }
    }

    const activeUser = getActiveIdentityUser();
    const sessionUuid = uuidFromUser(activeUser);
    if (sessionUuid) {
      return { uuid: sessionUuid, email: emailFromUser(activeUser) };
    }

    setLastError('Session UUID is unavailable. Please sign out and log in again.');
    return null;
  }

  async function resolveDbUuid(userKey) {
    setLastError('');

    if (!global.DatabaseManager || typeof global.DatabaseManager.ensureUserByUuid !== 'function') {
      const message = 'DatabaseManager is not available.';
      setLastError(message);
      console.error(message);
      return null;
    }

    const identity = await resolveDbIdentity(userKey);
    if (!identity || !identity.uuid) {
      const message = lastErrorMessage || 'Session UUID is unavailable. Please sign out and log in again.';
      setLastError(message);
      return null;
    }

    const result = await global.DatabaseManager.ensureUserByUuid(identity.uuid, identity.email);
    if (result.error || !result.data || !result.data.uuid) {
      const message = result && result.error && result.error.message
        ? result.error.message
        : 'Unable to resolve database user UUID.';
      setLastError(message);
      console.error('Unable to resolve user UUID in database.', result.error);
      return null;
    }

    return result.data.uuid;
  }

  async function resolveUserKey(userOrKey) {
    const identity = await resolveDbIdentity(userOrKey);
    return identity ? identity.uuid : null;
  }

  async function getTodayEntry(userKey) {
    const uuid = await resolveDbUuid(userKey);
    if (!uuid) {
      return null;
    }

    const today = global.DatabaseManager.getTodayDate();
    const result = await global.DatabaseManager.getTodayEntry(uuid, today);
    if (result.error) {
      setLastError(result.error.message || 'Error loading today journal entry.');
      console.error('Error loading today journal entry.', result.error);
      return null;
    }

    return mapRowToEntry(result.data, userKey);
  }

  async function saveOrUpdateTodayEntry(userKey, content, mood) {
    const trimmed = (content || '').trim();
    if (!trimmed && !mood) {
      return null;
    }

    const uuid = await resolveDbUuid(userKey);
    if (!uuid) {
      return null;
    }

    const createdDate = global.DatabaseManager.getTodayDate();
    const current = await global.DatabaseManager.getTodayEntry(uuid, createdDate);
    const currentRow = current && current.data ? current.data : null;

    const nextContent = trimmed || (currentRow && currentRow.entry) || null;
    const nextEmotion = mood
      ? moodToBit(mood)
      : (currentRow ? currentRow.overall_emotion : null);

    const upsert = await global.DatabaseManager.upsertTodayEntry(
      uuid,
      createdDate,
      nextContent,
      nextEmotion
    );

    if (upsert.error) {
      setLastError(upsert.error.message || 'Error saving journal entry.');
      console.error('Error saving journal entry.', upsert.error);
      return null;
    }

    return mapRowToEntry(upsert.data, userKey);
  }

  async function saveJournalEntry(userKey, content, mood) {
    return saveOrUpdateTodayEntry(userKey, content, mood);
  }

  async function saveMood(userKey, mood) {
    if (!mood) {
      return null;
    }

    return saveOrUpdateTodayEntry(userKey, '', mood);
  }

  async function getLastJournalEntries(userKey, limit) {
    const uuid = await resolveDbUuid(userKey);
    if (!uuid) {
      return [];
    }

    const result = await global.DatabaseManager.getRecentEntries(uuid, limit);
    if (result.error || !Array.isArray(result.data)) {
      setLastError((result && result.error && result.error.message) || 'Error loading recent journal entries.');
      console.error('Error loading recent journal entries.', result.error);
      return [];
    }

    return result.data.map((row) => mapRowToEntry(row, userKey)).filter(Boolean);
  }

  global.JournalStore = {
    resolveUserKey,
    saveMood,
    saveJournalEntry,
    getTodayEntry,
    saveOrUpdateTodayEntry,
    getLastJournalEntries,
    getLastError: function () {
      return lastErrorMessage;
    }
  };
})(window);
