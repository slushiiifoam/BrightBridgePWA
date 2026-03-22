// Main app module - handles UI and orchestrates auth and data modules
const App = {
    elements: {},
    
    init() {
        Auth.init()

        // Cache DOM elements

        try{
            this.elements = {
            authView: document.getElementById('auth-view'),
            appView: document.getElementById('app-view'),
            loginBtn: document.getElementById('login-btn'),
            logoutBtn: document.getElementById('logout-btn'),
            userName: document.getElementById('user-name'),
            userEmail: document.getElementById('user-email'),
            dataInput: document.getElementById('data-input'),
            saveBtn: document.getElementById('save-btn'),
            dataList: document.getElementById('data-list')
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
        
        if(this.elements.saveBtn)
            this.elements.saveBtn.addEventListener('click', () => {
                this.handleSaveData();
            });
        
        if(this.elements.dataInput)
            this.elements.dataInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSaveData();
                }
            });
    },
    
    updateAuthUI() {
        const user = Auth.getUser();
        const onLoginPage = window.location.pathname.includes('login.html');

        // IF THE USER IS NULL:
        if (!user) {
            // Only redirect if we are NOT already on the login page
            if (!onLoginPage) {
                window.location.assign('/test/login.html');
            }
            return; // Stay here, do nothing else.
        }

        // IF THE USER EXISTS:
        if (onLoginPage) {
            window.location.assign('/test/home.html');
        } else {
            this.showAppView();
        }
},
    
    showAuthView() {
        this.elements.authView.classList.remove('hidden');
        this.elements.appView.classList.add('hidden');
    },
    
    showAppView() {
        const user = Auth.getUser();
        this.elements.userName.textContent = user.user_metadata.full_name || 'User';
        this.elements.userEmail.textContent = user.email;
        
        this.elements.authView.classList.add('hidden');
        this.elements.appView.classList.remove('hidden');
    },
    
    async handleSaveData() {
        const content = this.elements.dataInput.value.trim();
        
        if (!content) {
            this.showMessage('Please enter some data', 'error');
            return;
        }
        
        this.elements.saveBtn.disabled = true;
        this.elements.saveBtn.textContent = 'Saving...';
        
        try {
            await Data.saveItem(content);
            this.elements.dataInput.value = '';
            this.showMessage('Data saved successfully!', 'success');
            await this.loadUserData();
        } catch (error) {
            this.showMessage('Error saving data: ' + error.message, 'error');
        } finally {
            this.elements.saveBtn.disabled = false;
            this.elements.saveBtn.textContent = 'Save Data';
        }
    },
    
    async loadUserData() {
        this.elements.dataList.innerHTML = '<div class="loading">Loading your data...</div>';
        
        try {
            const items = await Data.loadItems();
            this.renderDataItems(items);
        } catch (error) {
            this.elements.dataList.innerHTML = `<div class="error">Error loading data: ${error.message}</div>`;
        }
    },
    
    renderDataItems(items) {
        if (items.length === 0) {
            this.elements.dataList.innerHTML = '<p style="color: var(--secondary-color); text-align: center;">No saved items yet. Add one above!</p>';
            return;
        }
        
        // Sort items by timestamp (newest first)
        items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        this.elements.dataList.innerHTML = items.map(item => `
            <div class="data-item" data-id="${item.id}">
                <div class="data-item-content">
                    <div>${this.escapeHtml(item.content)}</div>
                    <div class="data-item-time">${this.formatDate(item.timestamp)}</div>
                </div>
                <button class="btn btn-danger delete-btn" data-id="${item.id}">Delete</button>
            </div>
        `).join('');
        
        // Add delete button listeners
        this.elements.dataList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleDeleteItem(e.target.dataset.id);
            });
        });
    },
    
    async handleDeleteItem(itemId) {
        if (!confirm('Are you sure you want to delete this item?')) {
            return;
        }
        
        try {
            await Data.deleteItem(itemId);
            this.showMessage('Item deleted successfully!', 'success');
            await this.loadUserData();
        } catch (error) {
            this.showMessage('Error deleting item: ' + error.message, 'error');
        }
    },
    
    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = type;
        messageDiv.textContent = message;
        
        const container = this.elements.appView.querySelector('.data-section');
        container.insertBefore(messageDiv, container.firstChild);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return date.toLocaleDateString();
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

