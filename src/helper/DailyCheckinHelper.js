import '../database/databaseManager.js'
import '../database/journal-store.js'
import '../database/identity-display.js'

let currentUserKey = null;

window.addEventListener('load', async () => {
  if (window.netlifyIdentity) {
    const apiUrl = `${window.location.origin}/.netlify/identity`;
    window.netlifyIdentity.init({ APIUrl: apiUrl });

    let didResolveInit = false;

    const syncFromUser = async (user) => {

      if (window.JournalStore && typeof window.JournalStore.resolveUserKey === 'function') {
        currentUserKey = await window.JournalStore.resolveUserKey(user);
        await renderHistory();
      }
    };

    const currentUser = window.netlifyIdentity.currentUser();
    if (currentUser) {
      await syncFromUser(currentUser);
    }
  }

  document.body.style.opacity = '1';
  await renderHistory();
});

async function renderHistory() {
  const historyList = document.getElementById('historyList');

  const entries = (window.JournalStore && typeof window.JournalStore.getLastJournalEntries === 'function')
    ? await window.JournalStore.getLastJournalEntries(currentUserKey, 10)
    : [];

  if (!entries.length && historyList) {
    historyList.innerHTML = `
      <div class="entry-empty">
        <p>No journal entries yet.</p>
        <p>Your last 10 entries will appear here automatically.</p>
      </div>
    `;
    return;
  }

  if(historyList)
  historyList.innerHTML = entries.map((entry) => {
    const mood = entry.mood || 'none';
    const moodEmoji = getMoodEmoji(mood);
    const moodLabel = mood === 'none' ? 'Not selected' : capitalize(mood);

    return `
      <article class="journal-entry-card mood-${mood}">
        <div class="entry-top-row">
          <p class="entry-date">${entry.date}</p>
          <div class="entry-mood-badge" aria-label="Mood ${moodLabel}">
            <span class="entry-mood-emoji">${moodEmoji}</span>
            <span class="entry-mood-label">${moodLabel}</span>
          </div>
        </div>
        <p class="entry-content">${escapeHtml(entry.content)}</p>
      </article>
    `;
  }).join('');
}

function getMoodEmoji(mood) {
  if (mood === 'happy') return '😊';
  if (mood === 'neutral') return '😐';
  if (mood === 'sad') return '☹️';
  return '📝';
}

function capitalize(value) {
  if (!value) {
    return '';
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}