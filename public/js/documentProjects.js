document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const addProjectBtn = document.querySelector('.new-project-btn');
    const addProjectModal = document.getElementById('addProjectModal');
    const closeModalBtn = document.querySelector('.close-modal');
    const addProjectForm = document.getElementById('addProjectForm');
    const modalCancelBtn = document.querySelector('.form-actions .btn-secondary');

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
    addProjectForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Get form data
        const formData = new FormData(addProjectForm);
        const data = Object.fromEntries(formData);
        console.log('Project data:', data);
        
        // Here you would send data to the server
        // For now, just close the modal
        closeModal();
    });
});
