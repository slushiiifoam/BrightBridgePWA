// Data module - handles data storage via Netlify Blobs
const Data = {
    async saveItem(content) {
        const user = Auth.getUser();
        if (!user) {
            throw new Error('User not authenticated');
        }
        
        const item = {
            id: Date.now().toString(),
            content: content,
            userId: user.id,
            timestamp: new Date().toISOString()
        };
        
        try {
            const response = await fetch('/.netlify/functions/save-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Auth.getToken()}`
                },
                body: JSON.stringify(item)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save data');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error saving data:', error);
            throw error;
        }
    },
    
    async loadItems() {
        const user = Auth.getUser();
        if (!user) {
            throw new Error('User not authenticated');
        }
        
        try {
            const response = await fetch(`/.netlify/functions/get-data?userId=${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${Auth.getToken()}`
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to load data');
            }
            
            const data = await response.json();
            return data.items || [];
        } catch (error) {
            console.error('Error loading data:', error);
            throw error;
        }
    },
    
    async deleteItem(itemId) {
        const user = Auth.getUser();
        if (!user) {
            throw new Error('User not authenticated');
        }
        
        try {
            const response = await fetch('/.netlify/functions/delete-data', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Auth.getToken()}`
                },
                body: JSON.stringify({ itemId, userId: user.id })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete data');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error deleting data:', error);
            throw error;
        }
    }
};