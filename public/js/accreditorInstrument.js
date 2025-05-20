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
    
    // Get the project ID from the URL
    function getProjectId() {
        const pathParts = window.location.pathname.split('/');
        return pathParts[pathParts.length - 1];
    }
    
    // Show loading state in iframe
    function showLoading(frame) {
        frame.src = 'about:blank';
        const doc = frame.contentDocument || frame.contentWindow.document;
        doc.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:Arial,sans-serif;"><div style="text-align:center;"><div style="border:4px solid #f3f3f3;border-top:4px solid #3498db;border-radius:50%;width:40px;height:40px;margin:0 auto 20px;animation:spin 2s linear infinite;"></div><p>Loading content...</p></div></div>';
        doc.head.innerHTML = '<style>@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>';
    }
    
    // Handle task selection
    taskSelect.addEventListener('change', function() {
        const taskId = this.value;
        const projectId = getProjectId();
        
        if (!taskId) {
            // Reset iframes if no task is selected
            instrumentFrame.src = '/static/instrument-placeholder.html';
            return;
        }
        
        console.log('Task selected:', taskId, 'Project ID:', projectId);
        
        // Show loading state
        showLoading(instrumentFrame);
        
        // Fetch task details from the API
        fetch(`/accreditor/task/${projectId}/${taskId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch task details');
                }
                return response.json();
            })
            .then(data => {
                console.log('Task details:', data);
                
                if (data.success && data.task) {
                    // Update the instrument iframe with the URL from the task
                    if (data.task.accreditation_Instrument_URL) {
                        instrumentFrame.src = data.task.accreditation_Instrument_URL;
                    } else {
                        instrumentFrame.src = '/static/instrument-placeholder.html';
                    }
                    
                    // Keep evidence iframe with placeholder for now
                    // We'll implement this in a future update
                    evidenceFrame.src = '/static/evidence-placeholder.html';
                }
            })
            .catch(error => {
                console.error('Error fetching task details:', error);
                instrumentFrame.src = '/static/instrument-placeholder.html';
            });
    });
    
    documentSelect.addEventListener('change', function() {
        // This will be implemented in the next phase
        console.log('Document selected:', this.value);
    });
});
