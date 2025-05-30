// Client-side authentication system for Vercel deployment

// Check authentication on page load
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');
    
    // If not on login page and not authenticated, redirect to login
    if (!isLoggedIn || !userEmail) {
        if (!window.location.pathname.includes('/login') && window.location.pathname !== '/') {
            console.log('Not authenticated, redirecting to login');
            window.location.replace('/');
            return false;
        }
    }
    
    return true;
}

// Override fetch to add authentication headers
function setupAuthHeaders() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');
    
    if (isLoggedIn && userEmail) {
        // Add custom headers to all fetch requests
        const originalFetch = window.fetch;
        window.fetch = function(url, options = {}) {
            // Create new options object with auth headers
            const newOptions = { ...options };
            
            // Initialize headers if they don't exist
            if (!newOptions.headers) {
                newOptions.headers = {};
            }
            
            // If headers is a Headers object, convert to plain object
            if (newOptions.headers instanceof Headers) {
                const plainHeaders = {};
                for (const [key, value] of newOptions.headers.entries()) {
                    plainHeaders[key] = value;
                }
                newOptions.headers = plainHeaders;
            }
            
            // Add client auth headers
            newOptions.headers['x-client-auth'] = 'true';
            newOptions.headers['x-user-email'] = userEmail;
            if (userName) newOptions.headers['x-user-name'] = userName;
            if (userRole) newOptions.headers['x-user-role'] = userRole;
            
            // Call original fetch with new options
            return originalFetch(url, newOptions);
        };
        
        console.log('Added client authentication headers to all requests');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication first
    if (checkAuth()) {
        // Setup auth headers for all requests
        setupAuthHeaders();
        
        // Update UI with user info if available
        const userEmailElement = document.getElementById('userEmail');
        if (userEmailElement) {
            userEmailElement.textContent = localStorage.getItem('userEmail') || '';
        }
    }
    
    // Handle logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                // Clear localStorage
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userName');
                localStorage.removeItem('userRole');
                
                // Call logout API
                await fetch('/api/login/logout', {
                    method: 'POST',
                    credentials: 'same-origin'
                });
                
                // Redirect to login page
                window.location.href = '/';
            } catch (error) {
                console.error('Logout error:', error);
                // Redirect anyway
                window.location.href = '/';
            }
        });
    }
});
