// Modal management functions
function openEditModal(userId) {
    const editModal = document.getElementById('editUserModal');
    const userRow = document.querySelector(`button[data-user-id="${userId}"]`).closest('tr');
    
    // Get user data from the row
    const name = userRow.querySelector('.user-name-cell span').textContent;
    const email = userRow.querySelector('td:nth-child(2)').textContent;
    const role = userRow.querySelector('td:nth-child(3)').textContent;
    const status = userRow.querySelector('td:nth-child(4)').textContent;

    // Populate the form
    document.getElementById('editUserId').value = userId;
    document.getElementById('editName').value = name;
    document.getElementById('editEmail').value = email;
    document.getElementById('editRole').value = role.toLowerCase().replace(' ', '_');
    document.getElementById('editStatus').value = status.toLowerCase();

    // Show modal with animation
    editModal.style.display = 'block';
    setTimeout(() => editModal.classList.add('show'), 10);
}

function closeEditModal() {
    const editModal = document.getElementById('editUserModal');
    editModal.classList.remove('show');
    setTimeout(() => {
        editModal.style.display = 'none';
        document.getElementById('editUserForm').reset();
    }, 200);
}

document.addEventListener('DOMContentLoaded', function() {
    // Edit modal elements
    const editModal = document.getElementById('editUserModal');
    const editModalCloseBtn = editModal.querySelector('.close-modal');
    const editModalCancelBtn = editModal.querySelector('.btn-secondary');
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

    // Edit modal close handlers
    editModalCloseBtn.addEventListener('click', closeEditModal);
    editModalCancelBtn.addEventListener('click', closeEditModal);

    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        const addUserModal = document.getElementById('addUserModal');
        const editUserModal = document.getElementById('editUserModal');
        
        if (event.target === addUserModal) {
            closeModal();
        } else if (event.target === editUserModal) {
            closeEditModal();
        }
    });

    // Add click handlers to edit buttons
    document.querySelectorAll('.btn-icon[title="Edit User"]').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            openEditModal(userId);
        });
    });

    // Close modal when pressing Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && (addUserModal.style.display === 'block' || document.getElementById('editUserModal').style.display === 'block')) {
            if (addUserModal.style.display === 'block') {
                closeModal();
            } else {
                closeEditModal();
            }
        }
    });

    // Handle form submission
    addUserForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            role: document.getElementById('role').value
        };

        try {
            // Submit form data
            // Show loading state
            const submitButton = addUserForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Adding...';
            submitButton.disabled = true;

            const response = await fetch('/users/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            // Reset button state
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;

            if (result.success) {
                // Add new user to table
                const tableBody = document.querySelector('.users-table tbody');
                const emptyState = tableBody.querySelector('.empty-state');
                if (emptyState) {
                    tableBody.innerHTML = ''; // Remove empty state
                }

                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td>
                        <div class="user-name-cell">
                            <span>${result.user.name}</span>
                        </div>
                    </td>
                    <td>${result.user.email}</td>
                    <td>${result.user.role}</td>
                    <td>${result.user.status}</td>
                    <td>${result.user.last_login}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-icon" title="Edit User" data-user-id="${result.user.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon" title="Reset Password" data-user-id="${result.user.id}">
                                <i class="fas fa-key"></i>
                            </button>
                        </div>
                    </td>
                `;

                tableBody.insertBefore(newRow, tableBody.firstChild);
                closeModal();
                addUserForm.reset();

                // Show success message
                alert('User added successfully!');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error adding user:', error);
            
            // Reset button state if we hit an error
            const submitButton = addUserForm.querySelector('button[type="submit"]');
            submitButton.textContent = 'Add User';
            submitButton.disabled = false;

            // Show error message
            if (error.response) {
                const result = await error.response.json();
                alert(result.error || 'Failed to add user. Please try again.');
            } else {
                alert('Failed to add user. Please try again.');
            }
        }
    });
});
