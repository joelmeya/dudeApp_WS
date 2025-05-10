document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
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
                    // Show error message
                    if (typeof alertify !== 'undefined') {
                        alertify.error(data.message);
                    }
                }
            } catch (error) {
                console.error('Login error:', error);
                if (typeof alertify !== 'undefined') {
                    alertify.error('An error occurred during login');
                }
            }
        });
    }
});
