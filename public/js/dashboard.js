document.addEventListener('DOMContentLoaded', () => {
    // Check if we have login info in localStorage (fallback for Vercel)
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userEmail = localStorage.getItem('userEmail');
    
    if (isLoggedIn && userEmail) {
        // Add authorization header to all fetch requests
        const originalFetch = window.fetch;
        window.fetch = function(url, options = {}) {
            // Create new options object with authorization header
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
            
            // Add authorization header with user email as token
            newOptions.headers['Authorization'] = `Bearer ${userEmail}`;
            
            // Call original fetch with new options
            return originalFetch(url, newOptions);
        };
        
        console.log('Added authorization headers to all requests');
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
