document.addEventListener('DOMContentLoaded', () => {
    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/login/logout', {
                    method: 'POST',
                    credentials: 'same-origin'
                });

                if (response.ok) {
                    // Use AlertifyJS for notification if available
                    if (typeof alertify !== 'undefined') {
                        alertify.success('Logged out successfully');
                    }
                    
                    // Redirect to login page
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1000);
                } else {
                    if (typeof alertify !== 'undefined') {
                        alertify.error('Logout failed');
                    }
                }
            } catch (error) {
                console.error('Logout error:', error);
                if (typeof alertify !== 'undefined') {
                    alertify.error('An error occurred during logout');
                }
            }
        });
    }

    // Mobile Sidebar Toggle
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (event) => {
        if (window.innerWidth <= 768 && 
            sidebar.classList.contains('open') && 
            !sidebar.contains(event.target) && 
            !sidebarToggle.contains(event.target)) {
            sidebar.classList.remove('open');
        }
    });

    // Responsive sidebar handling
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('open');
        }
    });

    // Theme toggle functionality
    const themeToggleBtn = document.querySelector('.toggle-theme');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            
            // Save theme preference
            const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
            localStorage.setItem('theme-preference', currentTheme);
            
            // Notify theme change
            alertify.message(`Switched to ${currentTheme} theme`);
        });
    }

    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme-preference');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }

    // Optional: Active page highlighting
    const currentPath = window.location.pathname;
    document.querySelectorAll('.sidebar a').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.closest('li').classList.add('active');
        }
    });
});