// Auth module - handles Netlify Identity authentication
const Auth = {
    user: null,
    
    init() {

        if (window.location.hash.includes('access_token')) {
            window.history.replaceState("", document.title, window.location.pathname);
        }
        
        // Check for existing user
        this.user = netlifyIdentity.currentUser();
        
        // Set up event listeners
        netlifyIdentity.on('login', user => {
            this.user = user;
            this.onAuthChange();
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

                if(!localStorage.getItem('brightbridge_returning_user'))
                    this.onAuthChange();
            }
        });

        // Initialize Netlify Identity
        netlifyIdentity.init();
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