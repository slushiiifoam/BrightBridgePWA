
import {getJWTToken, parseUserToken} from '/js/tokenManager.js'

// Auth module - handles Netlify Identity authentication
const Auth = {
    user: null,
    
    init() { 

        const savedUser = parseUserToken();

        if(savedUser)
            this.user = savedUser;

        // Initialize Netlify Identity
        netlifyIdentity.init();

        // Handle redirect after email confirmation
        netlifyIdentity.on('init', user => {

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
    
    login() {
         netlifyIdentity.open();
    },
    
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
            window.location.assign('/test/login.html');
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
    
    getToken() {
        return this.user ? this.user.token.access_token : null;
    },
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