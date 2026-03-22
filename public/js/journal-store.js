// Shared localStorage helper for mood + journal check-ins.
// Keeping this in one file makes future Supabase migration easier.
(function (global) {
  const MOOD_KEY = 'brightbridge_mood_history';
  const JOURNAL_KEY = 'brightbridge_journal';

  function readList(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function writeList(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function resolveUserKey(user) {
    if (user && user.id) {
      return String(user.id);
    }

    const storedName = (localStorage.getItem('brightbridge_username') || '').trim();
    if (storedName) {
      return `name:${storedName.toLowerCase()}`;
    }

    return 'anonymous';
  }

  function saveMood(userKey, mood) {
    if (!mood) {
      return null;
    }

    const entry = {
      userKey,
      mood,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString()
    };

    const list = readList(MOOD_KEY);
    list.push(entry);
    writeList(MOOD_KEY, list);
    return entry;
  }

  function saveJournalEntry(userKey, content, mood) {
    const trimmed = (content || '').trim();
    if (!trimmed) {
      return null;
    }

    const entry = {
      userKey,
      content: trimmed,
      mood: mood || null,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString()
    };

    const list = readList(JOURNAL_KEY);
    list.push(entry);
    writeList(JOURNAL_KEY, list);
    return entry;
  }

  function getLastJournalEntries(userKey, limit) {
    const max = Number(limit) > 0 ? Number(limit) : 10;

    return readList(JOURNAL_KEY)
      .filter(item => item && item.userKey === userKey)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, max);
  }

  global.JournalStore = {
    resolveUserKey,
    saveMood,
    saveJournalEntry,
    getLastJournalEntries
  };
})(window);
