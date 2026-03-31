import Auth from '/js/auth.js'

// Main app module - handles UI and orchestrates auth and data modules
const App = {
    elements: {},
    
    init() {
        Auth.init()

        // Cache DOM elements

        try{
            this.elements = {
            loginBtn: document.getElementById('login-btn'),
            logoutBtn: document.getElementById('logout-btn'),
            userDisplay: document.getElementById('user-display'),
        };
        }catch(e){
            alert('error: '+e)
        }
        
        // Set up event listeners
        this.setupEventListeners();
    },
    
    setupEventListeners() {

        if(this.elements.loginBtn)
            this.elements.loginBtn.addEventListener('click', () => {
                Auth.login();
            });
        
        if(this.elements.logoutBtn)
            this.elements.logoutBtn.addEventListener('click', () => {
                Auth.logout();
            });

        if(this.elements.userDisplay)
            this.elements.userDisplay.textContent = Auth.getUsername() || "Guest";
        
    },
    
    updateAuthUI() {
        console.log('swtiching the user to another page')
        var savedUser = localStorage.getItem('brightbridge.user');
        var user;

        try {
            user = savedUser ? JSON.parse(savedUser) : null;
        } catch (e) {
            user = null; // Guard against malformed JSON
        }

        // IF THE USER IS NULL:
        if (!user) {
            // Only redirect if we are NOT already on the login page{

            if(!window.location.pathname.includes('login.html')){
                window.location.assign('/test/login.html');
                console.log('redirecting to login page');
                return;
            }
                
            console.log('the user doesnt exist but is on the login page');
            return; // Stay here, do nothing else.
        }

        console.log('the user exists');
        // IF THE USER EXISTS:
        if(window.location.pathname.includes('login.html'))
            window.location.assign('/test/home.html');

}
};

// Expose App globally so Auth can call updateAuthUI
window.App = App;

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

