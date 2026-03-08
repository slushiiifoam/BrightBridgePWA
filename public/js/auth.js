// Auth module - handles Netlify Identity authentication
const Auth = {
    user: null,
    
    init() {
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
        netlifyIdentity.open();
    },
    
    logout() {
        if (confirm('Are you sure you want to log out?')) {
            netlifyIdentity.logout();
        }
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
    }
};