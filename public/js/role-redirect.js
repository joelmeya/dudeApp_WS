/**
 * Role-based redirection script
 * Ensures users are directed to the appropriate pages based on their role
 */
document.addEventListener('DOMContentLoaded', function() {
  // Get user role from localStorage
  const userRole = localStorage.getItem('userRole');
  
  if (userRole) {
    const lowerCaseRole = userRole.toLowerCase();
    const currentPath = window.location.pathname;
    
    console.log('Role redirect check - Current path:', currentPath, 'User role:', lowerCaseRole);
    
    // Role-based redirections
    if (currentPath === '/dashboard' || currentPath === '/') {
      // Redirect Accreditor users to accreditor page
      if (lowerCaseRole === 'accreditor') {
        console.log('Redirecting Accreditor user to /accreditor');
        window.location.replace('/accreditor');
      }
      
      // Redirect Admin Assistant users to documents page
      else if (lowerCaseRole === 'admin_assistant') {
        console.log('Redirecting Admin Assistant user to /documents');
        window.location.replace('/documents');
      }
    }
  }
});
