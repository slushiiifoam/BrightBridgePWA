// Supabase configuration
const SUPABASE_URL = 'https://pyqznelkiujkmviedlha.supabase.co/';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5cXpuZWxraXVqa212aWVkbGhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NTU1NTYsImV4cCI6MjA4ODEzMTU1Nn0.An4UgrP5HczCd0OR2_dSzGdFshC_bPTmbiae4oLBh9s';

// Initialize Supabase client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('Supabase client initialized:', supabase);

// Mood tracking functions
const MoodTracker = {
    async saveMood(mood) {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const { data, error } = await supabase
                .from('moods')
                .insert([
                    {
                        mood: mood,
                        timestamp: new Date().toISOString(),
                        date: new Date().toLocaleDateString(),
                        user_id: userId
                    }
                ]);

            if (error) {
                console.error('Error saving mood to Supabase:', error);
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Failed to save mood:', error);
            throw error;
        }
    },

    getCurrentUserId() {
        // First try the Auth module
        if (window.Auth && window.Auth.getUser()) {
            return window.Auth.getUser().id || window.Auth.getUser().sub;
        }
        // Fallback: check netlifyIdentity directly (used in home.html)
        if (window.netlifyIdentity && window.netlifyIdentity.currentUser()) {
            return window.netlifyIdentity.currentUser().id || window.netlifyIdentity.currentUser().sub;
        }
        // Fallback for local mode
        if (window.Auth && window.Auth.isLocalMode()) {
            return 'local-user';
        }
        return null;
    }
};

// Expose globally for debugging
window.MoodTracker = MoodTracker;
window.supabaseClient = supabase;