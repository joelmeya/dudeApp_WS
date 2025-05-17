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
                    setTimeout(() => {
                        window.location.href = data.redirectUrl || '/dashboard';
                    }, 1000);
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
