document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const buttonText = submitButton.querySelector('.button-text');
        const buttonSpinner = submitButton.querySelector('.spinner');
        const loadingOverlay = document.querySelector('.loading-overlay');

        const setLoading = (isLoading) => {
            submitButton.disabled = isLoading;
            buttonText.classList.toggle('hidden', isLoading);
            buttonSpinner.style.display = isLoading ? 'block' : 'none';
            loadingOverlay.classList.toggle('visible', isLoading);
        };

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                // Show loading state
                setLoading(true);

                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                    credentials: 'same-origin'
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Show success message
                    if (typeof alertify !== 'undefined') {
                        alertify.success(data.message);
                    }
                    
                    // Redirect to dashboard or specified URL
                    // Store login state in localStorage for client-side auth
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userEmail', email);
                    localStorage.setItem('userName', data.user?.name || '');
                    localStorage.setItem('userRole', data.user?.role || '');
                    localStorage.setItem('loginTimestamp', Date.now().toString());
                    
                    console.log('Login successful, redirecting to:', data.redirectUrl || '/dashboard');
                    
                    // Add a special parameter to the URL to prevent redirect loops
                    const redirectUrl = (data.redirectUrl || '/dashboard') + '?auth=' + Date.now();
                    
                    // Use a more direct approach to redirect
                    setTimeout(() => {
                        window.location.replace(redirectUrl);
                    }, 500);
                } else {
                    // Hide loading state on error
                    setLoading(false);
                    // Show error message
                    if (typeof alertify !== 'undefined') {
                        alertify.error(data.message);
                    }
                }
            } catch (error) {
                // Hide loading state on error
                setLoading(false);
                console.error('Login error:', error);
                if (typeof alertify !== 'undefined') {
                    alertify.error('An error occurred during login');
                }
            }
        });
    }
});
