
import {getJWTToken, parseUserToken} from '/js/tokenManager.js'

// Auth module - handles Netlify Identity authentication
const Auth = {
    user: null,
    
    // Initialize Identity, restore cached session state, and wire auth event handlers.
    init() { 

        const savedUser = parseUserToken();

        if(savedUser)
            this.user = savedUser;

        // Initialize Netlify Identity
        netlifyIdentity.init();

        // Handle redirect after email confirmation
        netlifyIdentity.on('init', user => {

            user = parseUserToken();

            if(user){
                this.user = user;
                localStorage.setItem('brightbridge.user', JSON.stringify(user));
            }
            
            this.onAuthChange();
        });
        
        // Set up event listeners
        netlifyIdentity.on('login', user => {
            this.user = user;

            if (user) localStorage.setItem('brightbridge.user', JSON.stringify(user));
            else localStorage.removeItem('brightbridge.user');

            this.onAuthChange();
            netlifyIdentity.close();
        });
        
        netlifyIdentity.on('logout', () => {
            console.log('triggering logout sequence');
            this.user = null;
            localStorage.removeItem('brightbridge.user'); // Clean up the local storage token
            this.onAuthChange();
        });
        
        netlifyIdentity.on('error', err => {
            console.error('Identity error:', err);
        });
    },
    
    // Open the Netlify Identity login/signup modal.
    login() {
         netlifyIdentity.open();
    },
    
    // Clear local auth state and force navigation to the login page.
    logout() {
        if (confirm('Are you sure you want to log out?')) {
            // 1. Immediately wipe the data locally. 
            // We don't care what the server thinks anymore.
            this.user = null;
            localStorage.removeItem('brightbridge.user');

            // 2. Try to tell Netlify to logout (it will likely fail with a 401/404, but that's okay)
            try {
                netlifyIdentity.logout();
            } catch (e) {
                console.log("Netlify logout call failed, moving on...");
            }

            // 3. DO THE REDIRECT IMMEDIATELY.
            // This is the line that actually "moves" the user.
            console.log("Local cleanup done. Forcing redirect to login...");
            window.location.assign('/assets/login.html');
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
    getUsername(){
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
