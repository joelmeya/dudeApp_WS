document.addEventListener('DOMContentLoaded', function() {
    console.log('Document Projects JS loaded');
    
    // Get DOM elements - using the correct IDs from the HTML
    const addProjectBtn = document.querySelector('.new-project-btn');
    const addProjectModal = document.getElementById('newProjectModalUnique');
    const closeModalBtn = document.querySelector('.close-modal');
    const addProjectForm = document.getElementById('addProjectForm');
    const modalCancelBtn = document.querySelector('.form-actions .btn-secondary');
    
    console.log('Elements found:', {
        addProjectBtn: addProjectBtn ? 'Found' : 'Missing',
        addProjectModal: addProjectModal ? 'Found' : 'Missing',
        closeModalBtn: closeModalBtn ? 'Found' : 'Missing',
        addProjectForm: addProjectForm ? 'Found' : 'Missing',
        modalCancelBtn: modalCancelBtn ? 'Found' : 'Missing'
    });

    // Show modal when Add New Project button is clicked
    addProjectBtn.addEventListener('click', function() {
        addProjectModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    });

    // Close modal functions
    function closeModal() {
        addProjectModal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
        addProjectForm.reset(); // Reset form fields
    }

    // Close modal when clicking the close button
    closeModalBtn.addEventListener('click', closeModal);

    // Close modal when clicking cancel button
    modalCancelBtn.addEventListener('click', closeModal);

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === addProjectModal) {
            closeModal();
        }
    });

    // Set today as the default date
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    // Handle form submission
    addProjectForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Get form data
        const formData = new FormData(addProjectForm);
        const data = Object.fromEntries(formData);
        console.log('Project data:', data);
        
        // Show loading state
        const submitButton = addProjectForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
        submitButton.disabled = true;
        
        try {
            console.log('Sending data to server:', data);
            
            // Send data to server
            const response = await fetch('/documents/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            console.log('Response status:', response.status);
            
            const result = await response.json();
            
            // Reset button state
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
            
            if (result.success) {
                // Show success message
                alert('Project added successfully!');
                // Reload the page to show the new project
                window.location.reload();
            } else {
                throw new Error(result.error || 'Failed to add project');
            }
        } catch (error) {
            console.error('Error adding project:', error);
            
            // Reset button state
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
            
            // Show error message
            alert(error.message || 'Failed to add project. Please try again.');
        }
        
        // Close the modal
        closeModal();
    });
});
