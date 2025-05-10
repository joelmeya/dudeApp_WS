document.addEventListener('DOMContentLoaded', function() {
    // Search functionality
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');

    // Handle search
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        const tableRows = document.querySelectorAll('.users-table tbody tr');

        tableRows.forEach(row => {
            const name = row.querySelector('.user-name-cell span').textContent.toLowerCase();
            const email = row.querySelector('td:nth-child(2)').textContent.toLowerCase();

            if (name.includes(searchTerm) || email.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });

        // Show/hide empty state
        const emptyState = document.querySelector('.empty-state');
        const hasVisibleRows = Array.from(tableRows).some(row => row.style.display !== 'none');
        if (emptyState) {
            emptyState.style.display = hasVisibleRows ? 'none' : 'block';
        }
    }

    // Search button click
    searchBtn.addEventListener('click', performSearch);

    // Search on Enter key
    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            performSearch();
        }
    });


    // Get DOM elements
    const addUserBtn = document.getElementById('addUserBtn');
    const addUserModal = document.getElementById('addUserModal');
    const closeModalBtn = document.querySelector('.close-modal');
    const addUserForm = document.getElementById('addUserForm');
    const modalCancelBtn = document.querySelector('.form-actions .btn-secondary');

    // Show modal when Add New User button is clicked
    addUserBtn.addEventListener('click', function() {
        addUserModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        // Force reflow to ensure animation works
        void addUserModal.offsetWidth;
    });

    // Close modal functions
    function closeModal() {
        addUserModal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
        addUserForm.reset(); // Reset form fields
    }

    // Close modal when clicking the close button
    closeModalBtn.addEventListener('click', closeModal);

    // Close modal when clicking cancel button
    modalCancelBtn.addEventListener('click', closeModal);

    // Close modal when clicking outside the modal content
    addUserModal.addEventListener('click', function(event) {
        if (event.target === addUserModal) {
            closeModal();
        }
    });

    // Close modal when pressing Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && addUserModal.style.display === 'block') {
            closeModal();
        }
    });

    // Handle form submission
    addUserForm.addEventListener('submit', function(event) {
        event.preventDefault();
        // Add your form submission logic here
        // For now, just close the modal
        closeModal();
    });
});
