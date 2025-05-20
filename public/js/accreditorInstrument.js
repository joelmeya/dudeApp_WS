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
    
    // Simple loading state function
    function showLoading(frame) {
        frame.style.opacity = '0.5'; // Dim the iframe to indicate loading
    }
    
    function hideLoading(frame) {
        frame.style.opacity = '1'; // Restore opacity when loaded
    }
    
    // Load document in iframe without URL transformation
    function loadDocumentInIframe(frame, url) {
        // Show loading state
        showLoading(frame);
        
        console.log('Loading document URL:', url);
        
        // Load the URL directly without transformation
        frame.src = url;
        
        // Add load event listener
        const loadHandler = function() {
            hideLoading(frame);
            frame.removeEventListener('load', loadHandler);
        };
        
        frame.addEventListener('load', loadHandler);
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
                        // Use our new loading function that handles Google Docs properly
                        loadDocumentInIframe(instrumentFrame, data.task.accreditation_Instrument_URL);
                    } else {
                        instrumentFrame.src = '/static/instrument-placeholder.html';
                    }
                    
                    // Keep evidence iframe with placeholder for now
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
