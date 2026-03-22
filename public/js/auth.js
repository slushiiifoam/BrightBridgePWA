// Auth module - handles Netlify Identity authentication
const Auth = {
    user: null,
    
    init() {
        console.log('Auth module initializing...');
        // If we're running locally (not on Netlify), avoid calling netlifyIdentity.init()
        // because it will attempt to reach /.netlify/identity and can cause "Failed to fetch".
        const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
        const isNetlifyHost = window.location.hostname.endsWith('.netlify.app');
        const shouldUseNetlify = !isLocalhost && (isNetlifyHost || window.location.hostname.endsWith('.netlify.com'));

        if (!window.netlifyIdentity || !shouldUseNetlify) {
            // Local fallback mode: use localStorage to pretend a logged-in user
            this.localMode = true;
            this.user = JSON.parse(localStorage.getItem('brightbridge_user') || 'null');
            return;
        }

        // Initialize Netlify Identity
        netlifyIdentity.init();

        // Check for existing user
        this.user = netlifyIdentity.currentUser();

        // Set up event listeners
        netlifyIdentity.on('login', user => {
            this.user = user;
            this.onAuthChange();
            netlifyIdentity.close();
        });

        netlifyIdentity.on('logout', () => {
            this.user = null;
            this.onAuthChange();
        });

        netlifyIdentity.on('error', err => {
            console.error('Identity error:', err);
        });

        // Handle redirect after email confirmation
        netlifyIdentity.on('init', user => {
            if (user) {
                this.user = user;
                this.onAuthChange();
            }
        });
    },

    login() {
        if (this.localMode) {
            // In local mode, just create a dummy user and store it locally.
            const dummyUser = {
                id: 'local-user',
                email: localStorage.getItem('brightbridge_username') || 'local@example.com',
                token: { access_token: 'local-token' }
            };
            this.user = dummyUser;
            localStorage.setItem('brightbridge_user', JSON.stringify(dummyUser));
            this.onAuthChange();
            return;
        }

        netlifyIdentity.open();
    },
    
    logout() {
        if (!confirm('Are you sure you want to log out?')) {
            return;
        }

        if (this.localMode) {
            this.user = null;
            localStorage.removeItem('brightbridge_user');
            this.onAuthChange();
            return;
        }

        netlifyIdentity.logout();
    },
    
    onAuthChange() {
        // This will be called by app.js to update the UI
        if (window.App && typeof window.App.updateAuthUI === 'function') {
            window.App.updateAuthUI();
        }
    },
    
    isLoggedIn() {
        return this.user !== null;
    },
    
    getUser() {
        return this.user;
    },
    
    getUserId() {
        return this.user ? this.user.id : null;
    },
    
    getToken() {
        return this.user ? this.user.token.access_token : null;
    },

    isLocalMode() {
        return !!this.localMode;
    }
};

// Expose Auth globally
window.Auth = Auth;