
import { getJWTToken } from '/js/tokenManager.js';

// Auth module - handles Netlify Identity authentication
const Auth = {
    user: null,

    syncUser(user) {
        this.user = user || null;

        if (this.user) {
            localStorage.setItem(
                'brightbridge.user',
                JSON.stringify(this.user)
            );
        } else {
            localStorage.removeItem('brightbridge.user');
        }

        this.onAuthChange();
    },

    init() {
        netlifyIdentity.on('init', user => {
            this.syncUser(user);
        });

        netlifyIdentity.on('login', user => {
            this.syncUser(user);
            netlifyIdentity.close();
        });

        netlifyIdentity.on('logout', () => {
            this.user = null;
            localStorage.removeItem('brightbridge.user');
            this.onAuthChange();
        });

        netlifyIdentity.on('error', error => {
            console.error('Identity error:', error);
        });

        netlifyIdentity.init({
            APIUrl: `${window.location.origin}/.netlify/identity`
        });
    },

    // Open the Netlify Identity login/signup modal.
    login() {
        netlifyIdentity.open();
    },

    // Clear local auth state and force navigation to the login page.
    async logout() {
        if (!confirm('Are you sure you want to log out?')) {
            return;
        }

        try {
            await netlifyIdentity.logout();

            this.user = null;
            localStorage.removeItem('brightbridge.user');

            window.location.replace('/assets/login.html');
        } catch (error) {
            console.error('Logout failed:', error);
            alert('Sign out did not complete. Please check your connection and try again.');
        }
    },

    // Notify the global app shell that authentication state has changed.
    onAuthChange() {
        // This will be called by app.js to update the UI
        if (window.App && typeof window.App.updateAuthUI === 'function') {
            window.App.updateAuthUI();
        }
    },

    // Return whether an authenticated user object is currently available.
    isLoggedIn() {
        return this.user !== null;
    },

    // Return the current user object from in-memory auth state.
    getUser() {
        return this.user;
    },

    // Return the current access token string when logged in.
    getToken() {
        return this.user ? this.user.token.access_token : null;
    },
    // Decode and return a friendly display name from the JWT metadata.
    getUsername() {
        try {
            const userData = getJWTToken();

            return userData.user_metadata.full_name || "User";
        } catch (e) {
            console.error("Invalid token format", e);
            this.logout();
            return null;
        }
    },
    // Decode and return the authenticated user UUID/subject from the JWT.
    getUserId() {
        try {
            const userData = getJWTToken();
            return userData.sub;
        } catch (e) {
            this.logout();
            return null;
        }
    }
};

export default Auth
