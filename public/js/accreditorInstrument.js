document.addEventListener('DOMContentLoaded', function() {
    const taskSelect = document.getElementById('taskSelect');
    const documentSelect = document.getElementById('documentSelect');
    const evidenceFrame = document.getElementById('evidenceFrame');
    const instrumentFrame = document.getElementById('instrumentFrame');
    
    // Ensure dropdowns appear above iframes
    function setupDropdowns() {
        const selects = document.querySelectorAll('select.form-control');
        selects.forEach(select => {
            select.addEventListener('focus', function() {
                // Add a class to the body when dropdown is open
                document.body.classList.add('dropdown-active');
            });
            
            select.addEventListener('blur', function() {
                // Remove the class when dropdown is closed
                setTimeout(() => {
                    document.body.classList.remove('dropdown-active');
                }, 200);
            });
        });
    }
    
    // Add tooltip functionality for project title
    function setupProjectTitleTooltip() {
        const projectTitle = document.querySelector('.project-title');
        if (projectTitle) {
            const fullTitle = projectTitle.getAttribute('data-full-title');
            
            // Only add tooltip if title is truncated
            if (projectTitle.offsetWidth < projectTitle.scrollWidth) {
                projectTitle.setAttribute('title', fullTitle);
            }
        }
    }
    
    setupDropdowns();
    setupProjectTitleTooltip();
    
    // For demonstration purposes - in a real implementation, this would make an AJAX call
    // or submit the form to update the page with the selected task and document
    taskSelect.addEventListener('change', function() {
        // Placeholder for actual implementation
        console.log('Task selected:', this.value);
    });
    
    documentSelect.addEventListener('change', function() {
        // Placeholder for actual implementation
        console.log('Document selected:', this.value);
    });
});
