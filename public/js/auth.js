// Auth module - handles Netlify Identity authentication
const Auth = {
    user: null,
    
    init() {
        if (window.IdentitySession && typeof window.IdentitySession.initIdentity === 'function') {
            window.IdentitySession.initIdentity();
        } else {
            // Safari can be strict with relative endpoint resolution for identity settings.
            const apiUrl = `${window.location.origin}/.netlify/identity`;
            netlifyIdentity.init({ APIUrl: apiUrl });
        }
        
        // Check for existing user
        this.user = (window.IdentitySession && typeof window.IdentitySession.getCurrentUser === 'function')
            ? window.IdentitySession.getCurrentUser()
            : netlifyIdentity.currentUser();
        
        // Set up event listeners
        netlifyIdentity.on('login', user => {
            if (window.IdentitySession && typeof window.IdentitySession.clearSignedOutLock === 'function') {
                window.IdentitySession.clearSignedOutLock();
            } else {
                localStorage.removeItem('brightbridge_signed_out');
            }
            this.user = user;
            this.onAuthChange();
            netlifyIdentity.close();
        });
        
        netlifyIdentity.on('logout', () => {
            this.user = null;
            this.onAuthChange();
        });
        
        netlifyIdentity.on('error', err => {
            const message = err && err.message ? err.message : '';
            if (message.includes('Failed to load settings from') || message.includes('Load failed')) {
                console.warn('Identity settings endpoint unavailable:', message);
                return;
            }

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
            if (window.IdentitySession && typeof window.IdentitySession.setSignedOutLock === 'function') {
                window.IdentitySession.setSignedOutLock();
            } else {
                localStorage.setItem('brightbridge_signed_out', 'true');
            }
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