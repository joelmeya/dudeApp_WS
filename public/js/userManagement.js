// User Management JavaScript for Project Details
document.addEventListener('DOMContentLoaded', function() {
    // Get the current user role from a data attribute on the body
    const userRole = document.body.getAttribute('data-user-role') || '';
    const restrictedRoles = ['admin_assistant', 'document_reviewer'];
    const isRestrictedRole = restrictedRoles.includes(userRole.toLowerCase());
    
    // Function to hide all remove buttons (for restricted roles)
    function hideAllRemoveButtons() {
        if (isRestrictedRole) {
            console.log('Restricted role detected, hiding remove buttons');
            const removeButtons = document.querySelectorAll('.remove-user-btn, .assigned-user-item button, #assignedUsersList button');
            removeButtons.forEach(button => {
                button.style.display = 'none';
            });
        }
    }
    
    // Run immediately
    hideAllRemoveButtons();
    
    // Also run after a short delay to catch any buttons added after page load
    setTimeout(hideAllRemoveButtons, 500);
    
    // Set up a mutation observer to watch for new elements being added
    const assignedUsersList = document.getElementById('assignedUsersList');
    if (assignedUsersList && isRestrictedRole) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    hideAllRemoveButtons();
                }
            });
        });
        
        observer.observe(assignedUsersList, { childList: true, subtree: true });
    }
    
    // Function to create a user item in the assigned users list
    function createUserItem(userId, userName, canRemove = true) {
        const li = document.createElement('li');
        li.className = 'assigned-user-item';
        li.setAttribute('data-user-id', userId);
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'user-name';
        nameSpan.textContent = userName;
        li.appendChild(nameSpan);
        
        // Only add remove button if user has permission
        if (canRemove) {
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-user-btn';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.onclick = function() {
                li.remove();
                updateAssignedUsersIds();
            };
            li.appendChild(removeBtn);
        }
        
        return li;
    }
    
    // Function to update the hidden input with assigned user IDs
    function updateAssignedUsersIds() {
        const userItems = document.querySelectorAll('#assignedUsersList .assigned-user-item');
        const userIds = Array.from(userItems).map(item => item.getAttribute('data-user-id'));
        document.getElementById('assignedUsersIds').value = userIds.join(',');
    }
    
    // Add user button functionality
    const addUserBtn = document.getElementById('addAssignedUser');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', function() {
            const dropdown = document.getElementById('assignedUsersDropdown');
            if (dropdown && dropdown.value) {
                const userId = dropdown.value;
                const userName = dropdown.options[dropdown.selectedIndex].text;
                
                // Check if user is already in the list
                const existingUser = document.querySelector(`#assignedUsersList .assigned-user-item[data-user-id="${userId}"]`);
                if (!existingUser) {
                    const usersList = document.getElementById('assignedUsersList');
                    usersList.appendChild(createUserItem(userId, userName));
                    updateAssignedUsersIds();
                    dropdown.selectedIndex = 0; // Reset dropdown
                }
            }
        });
    }
    
    // Initialize the assigned users list with existing data
    function initializeAssignedUsers() {
        // This would typically come from server-side data
        const assignedUsersData = window.initialAssignedUsers || [];
        const usersList = document.getElementById('assignedUsersList');
        
        if (usersList && assignedUsersData.length > 0) {
            assignedUsersData.forEach(user => {
                // For restricted roles, create user items without remove buttons
                usersList.appendChild(createUserItem(user.id, user.name, !isRestrictedRole));
            });
            updateAssignedUsersIds();
        }
    }
    
    // Call initialization
    initializeAssignedUsers();
});
