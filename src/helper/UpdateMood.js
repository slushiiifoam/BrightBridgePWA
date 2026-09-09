

//allows the user to do a quick mood check
function quickMoodCheck(event, mood) {
  const moodEntry = {
    mood: mood,
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleDateString()
  };
  
  let moodHistory = JSON.parse(localStorage.getItem('brightbridge_mood_history') || '[]');
  moodHistory.push(moodEntry);
  localStorage.setItem('brightbridge_mood_history', JSON.stringify(moodHistory));
  
  const selectedBtn = event.target.closest('.mood-btn');
  selectedBtn.style.transform = 'scale(1.2)';
  setTimeout(() => {
    selectedBtn.style.transform = '';
  }, 200);
  
  showNotification('Mood logged! Thank you for checking in.');
}
    
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--mood-happy);
    color: white;
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    z-index: 10000;
    animation: slideDown 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideUp 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

export default quickMoodCheck