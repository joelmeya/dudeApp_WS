document.addEventListener('DOMContentLoaded', function() {
    // Deployment trigger: 2025-05-20 07:23 - Force Vercel update
    console.log('Task Form JS loaded');
    
    // Make sure the task modal is hidden on page load
    const taskModal = document.getElementById('updateTaskModal');
    if (taskModal) {
        taskModal.style.display = 'none';
    }
    
    // Show success message if present in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
        alertify.success('Task updated successfully!');
        // Remove the success parameter from URL to prevent showing the message again on refresh
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }
    
    // Show error message if present in URL parameters
    const errorMsg = urlParams.get('error');
    if (errorMsg) {
        alertify.error(errorMsg);
        // Remove the error parameter from URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }
    
    // We'll initialize the modal components only when it's opened, not on page load
});

// Function to open the task modal and populate the form
function openTaskModal(button) {
    console.log('openTaskModal called');
    
    // Get the modal elements
    const modal = document.getElementById('updateTaskModal');
    const modalOverlay = document.getElementById('modalOverlay');
    
    if (!modal) {
        console.error('Modal element not found');
        return;
    }
    
    // Get task data from the row
    const row = button.closest('tr');
    if (!row || !row.cells || row.cells.length < 4) {
        console.error('Invalid row structure:', row);
        return;
    }
    
    try {
        // Extract task data
        const taskId = button.getAttribute('data-task-id') || row.getAttribute('data-task-id') || '1';
        const taskNameText = row.cells[0].textContent.trim();
        const taskDescription = row.cells[1].textContent.trim();
        const statusBadge = row.cells[2].querySelector('.status-badge');
        const taskStatus = statusBadge ? statusBadge.textContent.trim() : 'New';
        const taskPercentageText = row.cells[3].textContent.trim();
        const taskPercentage = parseInt(taskPercentageText) || 0;
        
        console.log('Task data extracted:', { 
            taskId, 
            taskNameText, 
            taskStatus, 
            taskPercentage 
        });
        
        // Set the modal title (just the task name without 'Task Details:' prefix)
        const modalTitle = document.getElementById('taskModalTitle');
        if (modalTitle) {
            modalTitle.textContent = taskNameText;
            console.log('Updated modal title to show only task name');
        }
        
        // Set form field values
        document.getElementById('taskId').value = taskId;
        
        // Set the status dropdown
        const statusSelect = document.getElementById('taskStatus');
        if (statusSelect) {
            for (let i = 0; i < statusSelect.options.length; i++) {
                if (statusSelect.options[i].value === taskStatus) {
                    statusSelect.selectedIndex = i;
                    break;
                }
            }
        }
        
        // Set the percentage dropdown
        const percentageDropdown = document.getElementById('percentageDropdown');
        if (percentageDropdown) {
            // Find the closest percentage value (0, 25, 50, 75, 100)
            const percentageValues = [0, 25, 50, 75, 100];
            let closestValue = percentageValues.reduce((prev, curr) => {
                return (Math.abs(curr - taskPercentage) < Math.abs(prev - taskPercentage) ? curr : prev);
            });
            
            // Set the dropdown value
            for (let i = 0; i < percentageDropdown.options.length; i++) {
                if (parseInt(percentageDropdown.options[i].value) === closestValue) {
                    percentageDropdown.selectedIndex = i;
                    break;
                }
            }
        }
        
        // Show the modal
        modal.style.display = 'block';
        if (modalOverlay) {
            modalOverlay.style.display = 'block';
        }
        
        // Reset the global arrays
        assignedUsers = [];
        taskDocuments = [];
        
        // Initialize task modal components AFTER setting the task ID
        initializeTaskModal();
        
        // Load data for this task with slight delay between calls to prevent interference
        loadAssignedUsers(taskId);
        
        // Add a small delay before loading documents to prevent race conditions
        setTimeout(() => {
            loadTaskDocuments(taskId);
        }, 100);
        
        // Load feedbacks for this task
        setTimeout(() => {
            loadTaskFeedbacks();
        }, 200);
        
        // Directly attach event listener to the document add button
        setTimeout(() => {
            const addDocumentBtn = document.getElementById('addDocumentBtn');
            if (addDocumentBtn) {
                console.log('Directly attaching click event to Add Document button');
                
                // Remove any existing listeners
                const newBtn = addDocumentBtn.cloneNode(true);
                addDocumentBtn.parentNode.replaceChild(newBtn, addDocumentBtn);
                
                // Add direct click handler
                newBtn.onclick = function(event) {
                    event.preventDefault();
                    console.log('Add document button clicked (direct handler)');
                    
                    const nameInput = document.getElementById('documentName');
                    const urlInput = document.getElementById('documentUrl');
                    
                    if (!nameInput || !urlInput) {
                        alertify.error('Document form inputs not found');
                        return;
                    }
                    
                    const name = nameInput.value.trim();
                    const url = urlInput.value.trim();
                    
                    if (!name) {
                        alertify.error('Please enter a document name');
                        return;
                    }
                    
                    if (!url) {
                        alertify.error('Please enter a document URL');
                        return;
                    }
                    
                    // Add the document
                    addDocumentToTask(name, url);
                    
                    // Clear inputs
                    nameInput.value = '';
                    urlInput.value = '';
                    nameInput.focus();
                    
                    // Show success message
                    alertify.success('Document added successfully');
                };
            }
        }, 300);
        
        console.log('Modal should be visible now');
    } catch (error) {
        console.error('Error populating task form:', error);
        alertify.error('Error opening task form. Please try again.');
    }
}

// Function to close the task modal
function closeTaskModal() {
    console.log('closeTaskModal called');
    
    const modal = document.getElementById('updateTaskModal');
    const modalOverlay = document.getElementById('modalOverlay');
    
    if (modal) modal.style.display = 'none';
    if (modalOverlay) modalOverlay.style.display = 'none';
}

// Function to initialize document button event listeners
function initializeDocumentButtons() {
    const addDocumentBtn = document.querySelector('.task-section .btn-primary');
    const viewButtons = document.querySelectorAll('.documents-table .btn-secondary');
    
    if (addDocumentBtn) {
        addDocumentBtn.addEventListener('click', function(e) {
            e.preventDefault();
            alertify.info('Add document functionality will be implemented soon.');
        });
    }
    
    if (viewButtons.length > 0) {
        viewButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                alertify.info('View document functionality will be implemented soon.');
            });
        });
    }
}

// Global variable to track assigned users
let assignedUsers = [];

// Function to add a user to the assigned list
function addUserToAssignedList(userId, userName) {
    // Get the current elements
    const assignedUsersList = document.getElementById('assignedUsersList');
    const assignedUsersIdsInput = document.getElementById('assignedUsersIds');
    
    if (!assignedUsersList || !assignedUsersIdsInput) {
        console.error('Required elements not found');
        return;
    }
    
    // Check if user is already assigned
    if (assignedUsers.includes(userId)) {
        alertify.error('This user is already assigned to the task');
        return;
    }
    
    // Add to array
    assignedUsers.push(userId);
    
    // Create list item
    const li = document.createElement('li');
    li.innerHTML = `
        <div class="user-info">
            <div class="user-avatar">${userName.charAt(0)}</div>
            <span>${userName}</span>
        </div>
        <button type="button" class="remove-user" data-user-id="${userId}">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to list
    assignedUsersList.appendChild(li);
    
    // Update hidden input
    assignedUsersIdsInput.value = assignedUsers.join(',');
}

// Function to remove a user from the assigned list
function removeUserFromAssignedList(userId) {
    // Get the current elements
    const assignedUsersList = document.getElementById('assignedUsersList');
    const assignedUsersIdsInput = document.getElementById('assignedUsersIds');
    
    if (!assignedUsersList || !assignedUsersIdsInput) {
        console.error('Required elements not found');
        return;
    }
    
    // Find the list item to remove
    const listItem = assignedUsersList.querySelector(`button[data-user-id="${userId}"]`).closest('li');
    if (listItem) {
        // Remove from array
        assignedUsers = assignedUsers.filter(id => id !== userId);
        
        // Remove from list
        listItem.remove();
        
        // Update hidden input
        assignedUsersIdsInput.value = assignedUsers.join(',');
        
        // Re-enable the option for this user in the dropdown
        const dropdown = document.getElementById('assignedUsersDropdown');
        if (dropdown) {
            for (let i = 0; i < dropdown.options.length; i++) {
                if (dropdown.options[i].value === userId) {
                    dropdown.options[i].disabled = false;
                    break;
                }
            }
        }
        
        // Call API to remove user from the task_assignedUsers table
        const taskId = document.getElementById('taskId').value;
        if (taskId) {
            // Get the project ID from the URL
            const urlParts = window.location.pathname.split('/');
            const projectId = urlParts[urlParts.length - 1];
            
            // Call the API endpoint
            fetch(`/project-details/${projectId}/tasks/${taskId}/assigned-users/${userId}`, {
                method: 'DELETE',
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to remove user from task');
                }
                return response.json();
            })
            .then(data => {
                console.log('User removed from task:', data);
            })
            .catch(error => {
                console.error('Error removing user from task:', error);
                // Continue with the UI update even if the API call fails
            });
        }
    }
}

// User assignment functionality
function initializeUserAssignment() {
    console.log('Initializing user assignment');
    
    // First, remove any existing event listeners by removing and re-adding the elements
    const modal = document.getElementById('updateTaskModal');
    if (!modal) {
        console.error('Modal not found');
        return;
    }
    
    // Setup the Add button
    const addAssignedUserBtn = document.getElementById('addAssignedUser');
    if (addAssignedUserBtn) {
        // Remove existing listeners
        const newAddBtn = addAssignedUserBtn.cloneNode(true);
        if (addAssignedUserBtn.parentNode) {
            addAssignedUserBtn.parentNode.replaceChild(newAddBtn, addAssignedUserBtn);
        }
        
        // Add new listener
        newAddBtn.addEventListener('click', function() {
            const dropdown = document.getElementById('assignedUsersDropdown');
            if (!dropdown || dropdown.selectedIndex === 0) {
                alertify.warning('Please select a user first');
                return;
            }
            
            const userId = dropdown.value;
            const userName = dropdown.options[dropdown.selectedIndex].text;
            
            addUserToAssignedList(userId, userName);
            
            // Disable the option for this user in the dropdown
            for (let i = 0; i < dropdown.options.length; i++) {
                if (dropdown.options[i].value === userId) {
                    dropdown.options[i].disabled = true;
                    break;
                }
            }
            
            // Reset dropdown
            dropdown.selectedIndex = 0;
            
            // Show notification
            alertify.success('User assigned successfully');
        });
    }
    
    // Setup the user list for removal
    const assignedUsersList = document.getElementById('assignedUsersList');
    if (assignedUsersList) {
        // Remove existing listeners
        const newList = assignedUsersList.cloneNode(false); // false = don't clone children
        if (assignedUsersList.parentNode) {
            // Copy children manually to preserve them
            while (assignedUsersList.firstChild) {
                newList.appendChild(assignedUsersList.firstChild);
            }
            assignedUsersList.parentNode.replaceChild(newList, assignedUsersList);
        }
        
        // Add new listener using event delegation
        newList.addEventListener('click', function(e) {
            const removeBtn = e.target.closest('.remove-user');
            if (removeBtn) {
                const userId = removeBtn.dataset.userId;
                
                // Remove the user
                removeUserFromAssignedList(userId);
                
                // Show notification
                alertify.success('User removed from task');
            }
        });
    }
}

// Function to load existing assigned users when editing a task
function loadAssignedUsers(taskId) {
    console.log('Loading assigned users for task ID:', taskId);
    
    // Get the project ID from the URL
    const urlParts = window.location.pathname.split('/');
    const projectId = urlParts[urlParts.length - 1];
    
    // Clear existing list
    const assignedUsersList = document.getElementById('assignedUsersList');
    if (assignedUsersList) {
        assignedUsersList.innerHTML = '';
    }
    
    // Reset the global assignedUsers array
    assignedUsers = [];
    
    // Update the hidden input
    const assignedUsersIdsInput = document.getElementById('assignedUsersIds');
    if (assignedUsersIdsInput) {
        assignedUsersIdsInput.value = '';
    }
    
    // Fetch assigned users from the API
    fetch(`/project-details/${projectId}/tasks/${taskId}/assigned-users`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch assigned users');
            }
            return response.json().catch(err => {
                console.warn('JSON parsing failed, trying fallback:', err);
                // If JSON parsing fails (e.g., HTML response), try fallback
                return [];
            });
        })
        .then(data => {
            // Check if there are any assigned users
            if (data && data.length > 0) {
                // Add each user to the list using our helper function
                data.forEach(user => {
                    addUserToAssignedList(user.id, user.name + ' (' + user.role + ')');
                    
                    // Disable the option for this user in the dropdown
                    const dropdown = document.getElementById('assignedUsersDropdown');
                    if (dropdown) {
                        for (let i = 0; i < dropdown.options.length; i++) {
                            if (dropdown.options[i].value === user.id) {
                                dropdown.options[i].disabled = true;
                                break;
                            }
                        }
                    }
                });
            } else {
                // Display 'No user assigned' message
                const assignedUsersList = document.getElementById('assignedUsersList');
                if (assignedUsersList) {
                    const noUserMessage = document.createElement('li');
                    noUserMessage.className = 'no-users-message';
                    noUserMessage.textContent = 'No user assigned';
                    assignedUsersList.appendChild(noUserMessage);
                }
            }
        })
        .catch(error => {
            console.error('Error loading assigned users:', error);
            
            // Try alternative approach with XMLHttpRequest for maximum compatibility with Vercel
            console.log('Trying fallback with XMLHttpRequest...');
            const xhr = new XMLHttpRequest();
            xhr.open('GET', `/project-details/${projectId}/tasks/${taskId}/assigned-users`, true);
            xhr.onload = function() {
                if (xhr.status === 200) {
                    try {
                        // Try to parse the response as JSON
                        const users = JSON.parse(xhr.responseText);
                        console.log('Fallback successful, users:', users);
                        
                        // Process the users
                        if (users && users.length > 0) {
                            users.forEach(user => {
                                addUserToAssignedList(user.id, user.name + ' (' + user.role + ')');
                            });
                        } else {
                            // Display 'No user assigned' message
                            const assignedUsersList = document.getElementById('assignedUsersList');
                            if (assignedUsersList) {
                                const noUserMessage = document.createElement('li');
                                noUserMessage.className = 'no-users-message';
                                noUserMessage.textContent = 'No user assigned';
                                assignedUsersList.appendChild(noUserMessage);
                            }
                        }
                    } catch (e) {
                        console.error('Error parsing fallback response:', e);
                        alertify.error('Failed to load assigned users');
                        
                        // Display 'No user assigned' message as a fallback
                        const assignedUsersList = document.getElementById('assignedUsersList');
                        if (assignedUsersList) {
                            const noUserMessage = document.createElement('li');
                            noUserMessage.className = 'no-users-message';
                            noUserMessage.textContent = 'No user assigned';
                            assignedUsersList.appendChild(noUserMessage);
                        }
                    }
                } else {
                    console.error('Fallback request failed with status:', xhr.status);
                    alertify.error('Failed to load assigned users');
                    
                    // Display 'No user assigned' message as a fallback
                    const assignedUsersList = document.getElementById('assignedUsersList');
                    if (assignedUsersList) {
                        const noUserMessage = document.createElement('li');
                        noUserMessage.className = 'no-users-message';
                        noUserMessage.textContent = 'No user assigned';
                        assignedUsersList.appendChild(noUserMessage);
                    }
                }
            };
            xhr.onerror = function() {
                console.error('Network error in fallback request');
                alertify.error('Failed to load assigned users');
                
                // Display 'No user assigned' message as a fallback
                const assignedUsersList = document.getElementById('assignedUsersList');
                if (assignedUsersList) {
                    const noUserMessage = document.createElement('li');
                    noUserMessage.className = 'no-users-message';
                    noUserMessage.textContent = 'No user assigned';
                    assignedUsersList.appendChild(noUserMessage);
                }
            };
            xhr.send();
        });
}

// Global variable to track task documents
let taskDocuments = [];

// Function to add a document to the task
function addDocumentToTask(name, url) {
    // Generate a unique ID for the document
    const docId = 'doc_' + Date.now();
    
    // Create document object
    const document = {
        id: docId,
        name: name,
        url: url
    };
    
    // Add to array
    taskDocuments.push(document);
    
    // Update the hidden input
    updateTaskDocumentsInput();
    
    // Add to the UI
    displayDocument(document);
    
    // Check if we need to hide the empty message
    toggleEmptyDocumentsMessage();
}

// Function to display a document in the list
function displayDocument(doc) {
    // Get the documents list element
    const documentsList = document.getElementById('documentsList');
    if (!documentsList) {
        console.error('Documents list element not found');
        return;
    }
    
    // Create document item element
    const docItem = document.createElement('div');
    docItem.className = 'document-item';
    docItem.setAttribute('data-doc-id', doc.id);
    
    // Create document content
    docItem.innerHTML = `
        <div class="doc-name-col">
            <div class="document-name" title="${doc.name}">${doc.name}</div>
        </div>
        <div class="doc-url-col">
            <div class="document-url" title="${doc.url}">${doc.url}</div>
        </div>
        <div class="doc-actions-col">
            <div class="document-actions">
                <a href="${doc.url}" class="view-document" target="_blank" title="View Document">
                    <i class="fas fa-external-link-alt"></i>
                </a>
                <button type="button" class="remove-document" data-doc-id="${doc.id}" title="Remove Document">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
    
    // Add to list
    documentsList.appendChild(docItem);
}

// Function to remove a document from the task
function removeDocumentFromTask(docId) {
    // Find the document in our array
    const docToRemove = taskDocuments.find(doc => doc.id === docId);
    if (!docToRemove) {
        console.error('Document not found:', docId);
        return;
    }
    
    // Get the document name for the API call
    const documentName = docToRemove.name;
    
    // Remove from array
    taskDocuments = taskDocuments.filter(doc => doc.id !== docId);
    
    // Update the hidden input
    updateTaskDocumentsInput();
    
    // Remove from UI
    const docItem = document.querySelector(`.document-item[data-doc-id="${docId}"]`);
    if (docItem) {
        docItem.remove();
    }
    
    // Check if we need to show the empty message
    toggleEmptyDocumentsMessage();
    
    // Call API to remove document from the Task_Documents table
    const taskId = document.getElementById('taskId').value;
    if (taskId && documentName) {
        // Get the project ID from the URL
        const urlParts = window.location.pathname.split('/');
        const projectId = urlParts[urlParts.length - 1];
        
        // Call the API endpoint
        fetch(`/project-details/${projectId}/tasks/${taskId}/documents/${encodeURIComponent(documentName)}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to remove document from task');
            }
            return response.json();
        })
        .then(data => {
            console.log('Document removed from task:', data);
        })
        .catch(error => {
            console.error('Error removing document from task:', error);
            // Continue with the UI update even if the API call fails
        });
    }
}

// Function to update the hidden input with documents data
function updateTaskDocumentsInput() {
    const taskDocumentsInput = document.getElementById('taskDocumentsData');
    if (taskDocumentsInput) {
        taskDocumentsInput.value = JSON.stringify(taskDocuments);
    }
}

// Function to toggle the empty documents message
function toggleEmptyDocumentsMessage() {
    const emptyMessage = document.getElementById('emptyDocumentsMessage');
    if (!emptyMessage) return;
    
    if (taskDocuments.length === 0) {
        emptyMessage.style.display = 'flex';
    } else {
        emptyMessage.style.display = 'none';
    }
}

// Function to initialize the documents functionality
function initializeDocuments() {
    console.log('Initializing documents functionality');
    
    // Reset documents array
    taskDocuments = [];
    
    // Clear the documents list
    const documentsList = document.getElementById('documentsList');
    if (documentsList) {
        documentsList.innerHTML = '';
    }
    
    // Update the hidden input
    updateTaskDocumentsInput();
    
    // Show the empty message
    toggleEmptyDocumentsMessage();
    
    // Setup the Add Document button
    const addDocumentBtn = document.getElementById('addDocumentBtn');
    console.log('Add Document button found:', addDocumentBtn);
    
    if (addDocumentBtn) {
        // Create a new button to replace the old one (to ensure clean event listeners)
        const newAddDocumentBtn = addDocumentBtn.cloneNode(true);
        addDocumentBtn.parentNode.replaceChild(newAddDocumentBtn, addDocumentBtn);
        
        // Add event listener to the new button
        newAddDocumentBtn.addEventListener('click', function(event) {
            console.log('Add document button clicked via event listener');
            handleAddDocument(event);
        });
        
        console.log('Added click event listener to Add Document button');
    } else {
        console.error('Add Document button not found');
    }
    
    // Setup document removal
    const documentListContainer = document.querySelector('.documents-list-container');
    if (documentListContainer) {
        // Create a new container to replace the old one (to ensure clean event listeners)
        const newDocumentListContainer = documentListContainer.cloneNode(true);
        documentListContainer.parentNode.replaceChild(newDocumentListContainer, documentListContainer);
        
        // Add event listener to the new container
        newDocumentListContainer.addEventListener('click', function(event) {
            if (event.target.classList.contains('remove-document') || 
                event.target.closest('.remove-document')) {
                handleRemoveDocument(event);
            }
        });
        
        console.log('Added click event listener to document list container');
    } else {
        console.error('Documents list container not found');
    }
}

// Handler for adding documents
function handleAddDocument(event) {
    // Prevent default form submission if this is triggered by a form
    if (event) {
        event.preventDefault();
    }
    
    console.log('Add document button clicked');
    
    // Prevent duplicate executions by debouncing
    if (handleAddDocument.isProcessing) {
        console.log('Already processing a document addition');
        return;
    }
    
    // Set processing flag
    handleAddDocument.isProcessing = true;
    
    try {
        const nameInput = document.getElementById('documentName');
        const urlInput = document.getElementById('documentUrl');
        
        if (!nameInput || !urlInput) {
            console.error('Document form inputs not found');
            alertify.error('Document form inputs not found');
            return;
        }
        
        const name = nameInput.value.trim();
        const url = urlInput.value.trim();
        
        console.log('Adding document:', { name, url });
        
        // Basic validation
        if (!name) {
            alertify.error('Please enter a document name');
            return;
        }
        
        if (!url) {
            alertify.error('Please enter a document URL');
            return;
        }
        
        // Add the document
        addDocumentToTask(name, url);
        
        // Clear inputs
        nameInput.value = '';
        urlInput.value = '';
        nameInput.focus();
        
        // Show success message
        alertify.success('Document added successfully');
    } catch (error) {
        console.error('Error adding document:', error);
        alertify.error('Error adding document');
    } finally {
        // Reset processing flag after a short delay
        setTimeout(() => {
            handleAddDocument.isProcessing = false;
        }, 300);
    }
}

// Handler for removing documents
function handleRemoveDocument(e) {
    console.log('Remove document handler triggered');
    
    // Find the remove button that was clicked
    const removeBtn = e.target.closest('.remove-document');
    if (!removeBtn) {
        console.log('No remove button found in event target');
        return;
    }
    
    // Get the document ID
    const docId = removeBtn.getAttribute('data-doc-id');
    if (!docId) {
        console.error('No document ID found on remove button');
        alertify.error('Error removing document: No document ID found');
        return;
    }
    
    console.log('Removing document with ID:', docId);
    
    try {
        // Remove the document
        removeDocumentFromTask(docId);
        alertify.success('Document removed successfully');
    } catch (error) {
        console.error('Error removing document:', error);
        alertify.error('Error removing document');
    }
}

// Function to load existing documents for a task
function loadTaskDocuments(taskId) {
    console.log('Loading documents for task ID:', taskId);
    
    // Get the project ID from the URL
    const urlParts = window.location.pathname.split('/');
    const projectId = urlParts[urlParts.length - 1];
    
    // Reset documents array
    taskDocuments = [];
    
    // Clear the documents list
    const documentsList = document.getElementById('documentsList');
    if (documentsList) {
        documentsList.innerHTML = '';
    }
    
    // Fetch documents from the API
    fetch(`/project-details/${projectId}/tasks/${taskId}/documents`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch task documents');
            }
            return response.json().catch(err => {
                console.warn('JSON parsing failed for documents, trying fallback:', err);
                // If JSON parsing fails (e.g., HTML response), try fallback
                return [];
            });
        })
        .then(data => {
            console.log('Documents loaded from database:', data);
            
            // Check if there are any documents
            if (data && data.length > 0) {
                // Add each document to the task
                data.forEach(doc => {
                    // Create document object in the format our UI expects
                    const document = {
                        id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9), // Generate a unique ID
                        name: doc.DocumentName,
                        url: doc.DocURL
                    };
                    
                    // Add to array
                    taskDocuments.push(document);
                    
                    // Display in UI
                    displayDocument(document);
                });
            } else {
                // No documents found
                console.log('No documents found for this task');
            }
            
            // Update the hidden input
            updateTaskDocumentsInput();
            
            // Toggle empty message
            toggleEmptyDocumentsMessage();
        })
        .catch(error => {
            console.error('Error loading task documents:', error);
            
            // Try alternative approach with XMLHttpRequest for maximum compatibility with Vercel
            console.log('Trying fallback with XMLHttpRequest for documents...');
            const xhr = new XMLHttpRequest();
            xhr.open('GET', `/project-details/${projectId}/tasks/${taskId}/documents`, true);
            xhr.onload = function() {
                if (xhr.status === 200) {
                    try {
                        // Try to parse the response as JSON
                        const documents = JSON.parse(xhr.responseText);
                        console.log('Fallback successful, documents:', documents);
                        
                        // Process the documents
                        if (documents && documents.length > 0) {
                            // Add each document to the task
                            documents.forEach(doc => {
                                // Create document object in the format our UI expects
                                const document = {
                                    id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9), // Generate a unique ID
                                    name: doc.DocumentName,
                                    url: doc.DocURL
                                };
                                
                                // Add to array
                                taskDocuments.push(document);
                                
                                // Display in UI
                                displayDocument(document);
                            });
                            
                            // Update the hidden input
                            updateTaskDocumentsInput();
                        }
                        
                        // Toggle empty message regardless of whether we found documents
                        toggleEmptyDocumentsMessage();
                    } catch (e) {
                        console.error('Error parsing fallback documents response:', e);
                        alertify.error('Failed to load task documents');
                        toggleEmptyDocumentsMessage(); // Show empty message as fallback
                    }
                } else {
                    console.error('Fallback request for documents failed with status:', xhr.status);
                    alertify.error('Failed to load task documents');
                    toggleEmptyDocumentsMessage(); // Show empty message as fallback
                }
            };
            xhr.onerror = function() {
                console.error('Network error in fallback request for documents');
                alertify.error('Failed to load task documents');
                toggleEmptyDocumentsMessage(); // Show empty message as fallback
            };
            xhr.send();
        });
}

// Initialize user assignment, documents, and feedbacks when the task modal is opened
function initializeTaskModal() {
    console.log('Initializing task modal components');
    
    // Initialize user assignment
    initializeUserAssignment();
    
    // Initialize documents
    initializeDocuments();
    
    // Initialize feedback functionality
    initializeFeedbackFallback();
    
    // Clear any existing event handlers to prevent duplicates
    removeAllEventHandlers();
    
    // Clear the feedback table body to prepare for new data
    const feedbackTableBody = document.getElementById('feedbackTableBody');
    if (feedbackTableBody) {
        feedbackTableBody.innerHTML = '';
    }
    
    // Show loading state for feedbacks
    const feedbackTable = document.getElementById('feedbackTable');
    const noFeedbacksMessage = document.getElementById('noFeedbacksMessage');
    
    if (feedbackTable) feedbackTable.style.display = 'none';
    if (noFeedbacksMessage) {
        noFeedbacksMessage.style.display = 'flex';
        const messageElement = noFeedbacksMessage.querySelector('.empty-state-message');
        if (messageElement) {
            messageElement.textContent = 'Loading feedbacks...';
        }
    }
    
    console.log('Task modal components initialized');
}

// Implementation for feedback functionality with database integration
function initializeFeedbackFallback() {
    console.log('Initializing feedback functionality with database integration');
    
    // Add event listener to the Add Feedback button
    const showFeedbackFormBtn = document.getElementById('showFeedbackForm');
    if (showFeedbackFormBtn) {
        showFeedbackFormBtn.addEventListener('click', function() {
            console.log('Add Feedback button clicked');
            const feedbackFormContainer = document.getElementById('feedbackFormContainer');
            if (feedbackFormContainer) {
                feedbackFormContainer.style.display = 'block';
                
                // Clear any previous input
                const feedbackText = document.getElementById('feedbackText');
                if (feedbackText) {
                    feedbackText.value = '';
                    feedbackText.focus();
                }
            }
        });
    }
    
    // Add event listener to the Add First Feedback button (empty state)
    const addFirstFeedbackBtn = document.getElementById('addFirstFeedback');
    if (addFirstFeedbackBtn) {
        addFirstFeedbackBtn.addEventListener('click', function() {
            const feedbackFormContainer = document.getElementById('feedbackFormContainer');
            if (feedbackFormContainer) {
                feedbackFormContainer.style.display = 'block';
                
                // Clear any previous input
                const feedbackText = document.getElementById('feedbackText');
                if (feedbackText) {
                    feedbackText.value = '';
                    feedbackText.focus();
                }
            }
        });
    }
    
    // Add event listener to the Cancel button
    const cancelFeedbackBtn = document.getElementById('cancelFeedback');
    if (cancelFeedbackBtn) {
        cancelFeedbackBtn.addEventListener('click', function() {
            console.log('Cancel Feedback button clicked');
            const feedbackFormContainer = document.getElementById('feedbackFormContainer');
            if (feedbackFormContainer) {
                feedbackFormContainer.style.display = 'none';
            }
        });
    }
    
    // Add event listener to the Submit button
    const submitFeedbackBtn = document.getElementById('submitFeedback');
    if (submitFeedbackBtn) {
        // Remove any existing event listeners to prevent duplicates
        const newSubmitBtn = submitFeedbackBtn.cloneNode(true);
        submitFeedbackBtn.parentNode.replaceChild(newSubmitBtn, submitFeedbackBtn);
        
        // Flag to prevent multiple submissions
        let isSubmitting = false;
        
        newSubmitBtn.addEventListener('click', function() {
            console.log('Submit Feedback button clicked');
            
            // Prevent multiple submissions
            if (isSubmitting) {
                console.log('Submission already in progress, ignoring duplicate click');
                return;
            }
            
            isSubmitting = true;
            
            // Get the feedback text
            const feedbackText = document.getElementById('feedbackText');
            
            if (!feedbackText || !feedbackText.value.trim()) {
                alertify.error('Please enter your feedback');
                isSubmitting = false;
                return;
            }
            
            // Get the task ID
            const taskId = document.getElementById('taskId').value;
            if (!taskId) {
                alertify.error('Task ID not found');
                isSubmitting = false;
                return;
            }
            
            // Get the project ID from the form action URL
            const formAction = document.getElementById('taskUpdateForm').getAttribute('action');
            const projectId = formAction.split('/')[2]; // Assuming format: /project-details/:projectId/update-task
            
            // Get the feedback content
            const feedbackContent = feedbackText.value.trim();
            
            // Send the feedback to the server
            fetch(`/project-details/${projectId}/tasks/${taskId}/feedbacks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ feedback: feedbackContent })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to submit feedback');
                }
                return response.json();
            })
            .then(newFeedback => {
                console.log('Feedback submitted successfully:', newFeedback);
                
                // Format the date
                const createdDate = new Date(newFeedback.Created_At);
                const formattedDate = createdDate.toLocaleDateString();
                
                // Create a new row for the feedback
                const row = document.createElement('tr');
                row.setAttribute('data-feedback-id', newFeedback.task_id);
                row.innerHTML = `
                    <td>${newFeedback.user_name || 'Unknown User'}</td>
                    <td>${formattedDate}</td>
                    <td class="feedback-preview">${newFeedback.Feedback}</td>
                    <td>
                        <button type="button" class="btn-sm btn-secondary view-feedback" data-feedback-id="${newFeedback.task_id}">View</button>
                    </td>
                `;
                
                // Add the row to the table (at the top)
                const feedbackTableBody = document.getElementById('feedbackTableBody');
                if (feedbackTableBody) {
                    feedbackTableBody.insertBefore(row, feedbackTableBody.firstChild);
                }
                
                // Show the table and hide the empty message
                const feedbackTable = document.getElementById('feedbackTable');
                const noFeedbacksMessage = document.getElementById('noFeedbacksMessage');
                
                if (feedbackTable) feedbackTable.style.display = 'table';
                if (noFeedbacksMessage) noFeedbacksMessage.style.display = 'none';
                
                // Hide the form
                const feedbackFormContainer = document.getElementById('feedbackFormContainer');
                if (feedbackFormContainer) {
                    feedbackFormContainer.style.display = 'none';
                }
                
                // Reset the form
                feedbackText.value = '';
                
                // Show success message
                alertify.success('Feedback submitted successfully');
                
                // Add event listener to the new view button
                const viewBtn = row.querySelector('.view-feedback');
                if (viewBtn) {
                    viewBtn.addEventListener('click', function() {
                        viewFeedbackFallback(newFeedback.task_id, newFeedback);
                    });
                }
                
                // Reset submission flag
                isSubmitting = false;
            })
            .catch(error => {
                console.error('Error submitting feedback:', error);
                alertify.error('Failed to submit feedback. Please try again.');
                isSubmitting = false;
            });
        });
    }
    
    // Create feedback modal if it doesn't exist
    createFeedbackModalFallback();
}

// Function to load feedbacks for a task from the database
function loadTaskFeedbacks() {
    const taskId = document.getElementById('taskId').value;
    if (!taskId) {
        console.error('Task ID not found');
        return;
    }
    
    // Get the project ID from the form action URL
    const formAction = document.getElementById('taskUpdateForm').getAttribute('action');
    const projectId = formAction.split('/')[2]; // Assuming format: /project-details/:projectId/update-task
    
    console.log(`Loading feedbacks for task ${taskId} in project ${projectId}`);
    
    // Clear existing feedbacks
    const feedbackTableBody = document.getElementById('feedbackTableBody');
    if (feedbackTableBody) {
        feedbackTableBody.innerHTML = '';
    }
    
    // Fetch feedbacks from the server
    fetch(`/project-details/${projectId}/tasks/${taskId}/feedbacks`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load feedbacks');
            }
            return response.json();
        })
        .then(feedbacks => {
            console.log(`Loaded ${feedbacks.length} feedbacks for task ${taskId}`);
            
            if (feedbacks.length === 0) {
                // Show the empty state message
                const feedbackTable = document.getElementById('feedbackTable');
                const noFeedbacksMessage = document.getElementById('noFeedbacksMessage');
                
                if (feedbackTable) feedbackTable.style.display = 'none';
                if (noFeedbacksMessage) noFeedbacksMessage.style.display = 'flex';
                return;
            }
            
            // Add each feedback to the table
            feedbacks.forEach(feedback => {
                // Format the date
                const createdDate = new Date(feedback.Created_At);
                const formattedDate = createdDate.toLocaleDateString();
                
                // Create a row for the feedback
                const row = document.createElement('tr');
                row.setAttribute('data-feedback-id', feedback.task_id);
                row.innerHTML = `
                    <td>${feedback.user_name || 'Unknown User'}</td>
                    <td>${formattedDate}</td>
                    <td class="feedback-preview">${feedback.Feedback}</td>
                    <td>
                        <button type="button" class="btn-sm btn-secondary view-feedback" data-feedback-id="${feedback.task_id}">View</button>
                    </td>
                `;
                
                // Add the row to the table
                if (feedbackTableBody) {
                    feedbackTableBody.appendChild(row);
                }
                
                // Add event listener to the view button
                const viewBtn = row.querySelector('.view-feedback');
                if (viewBtn) {
                    viewBtn.addEventListener('click', function() {
                        viewFeedbackFallback(feedback.task_id, feedback);
                    });
                }
            });
            
            // Show the table and hide the empty message
            const feedbackTable = document.getElementById('feedbackTable');
            const noFeedbacksMessage = document.getElementById('noFeedbacksMessage');
            
            if (feedbackTable) feedbackTable.style.display = 'table';
            if (noFeedbacksMessage) noFeedbacksMessage.style.display = 'none';
        })
        .catch(error => {
            console.error('Error loading feedbacks:', error);
            alertify.error('Failed to load feedbacks');
            
            // Show the empty state message as a fallback
            const feedbackTable = document.getElementById('feedbackTable');
            const noFeedbacksMessage = document.getElementById('noFeedbacksMessage');
            
            if (feedbackTable) feedbackTable.style.display = 'none';
            if (noFeedbacksMessage) noFeedbacksMessage.style.display = 'flex';
        });
}

// Function to check if there are any feedbacks and show/hide elements accordingly
function checkFeedbacksExistence() {
    const feedbackTable = document.getElementById('feedbackTable');
    const noFeedbacksMessage = document.getElementById('noFeedbacksMessage');
    const feedbackTableBody = document.getElementById('feedbackTableBody');
    
    if (!feedbackTable || !noFeedbacksMessage || !feedbackTableBody) return;
    
    // Check if there are any rows in the feedback table (excluding header)
    const hasRows = feedbackTableBody.querySelectorAll('tr').length > 0;
    
    // Show/hide elements based on whether there are feedbacks
    feedbackTable.style.display = hasRows ? 'table' : 'none';
    noFeedbacksMessage.style.display = hasRows ? 'none' : 'flex';
}

// Function to view feedback from database or DOM
function viewFeedbackFallback(feedbackId, feedbackData = null) {
    console.log('Viewing feedback with ID:', feedbackId);
    
    try {
        let from, date, text;
        
        // If feedback data is provided directly (from API response), use it
        if (feedbackData) {
            from = feedbackData.user_name || 'Unknown User';
            date = new Date(feedbackData.Created_At).toLocaleDateString();
            text = feedbackData.Feedback;
            
            console.log('Using provided feedback data:', { from, date, text });
        } else {
            // Otherwise, get the feedback data from the table row
            const feedbackButton = document.querySelector(`.view-feedback[data-feedback-id="${feedbackId}"]`);
            if (!feedbackButton) {
                console.error('Feedback button not found for ID:', feedbackId);
                alertify.error('Feedback not found');
                return;
            }
            
            const feedbackRow = feedbackButton.closest('tr');
            if (!feedbackRow) {
                console.error('Feedback row not found for button:', feedbackButton);
                alertify.error('Feedback not found');
                return;
            }
            
            // Get the feedback data from the row
            from = feedbackRow.cells[0].textContent;
            date = feedbackRow.cells[1].textContent;
            text = feedbackRow.cells[2].textContent;
            
            console.log('Feedback data from DOM:', { from, date, text });
        }
        
        // Ensure the modal exists
        if (!document.getElementById('feedbackViewModal')) {
            console.log('Creating feedback modal');
            createFeedbackModalFallback();
        }
        
        // Update the modal content
        document.getElementById('feedbackModalFrom').textContent = from;
        document.getElementById('feedbackModalDate').textContent = date;
        document.getElementById('feedbackModalContent').textContent = text;
        
        // Show the modal
        const modal = document.getElementById('feedbackViewModal');
        if (modal) {
            modal.style.display = 'block';
            console.log('Feedback modal displayed');
        } else {
            console.error('Feedback modal not found');
        }
    } catch (error) {
        console.error('Error viewing feedback:', error);
        alertify.error('Error viewing feedback');
    }
}

// Function to create the feedback modal (fallback implementation)
function createFeedbackModalFallback() {
    // Check if the modal already exists
    if (document.getElementById('feedbackViewModal')) return;
    
    // Create the modal
    const modal = document.createElement('div');
    modal.id = 'feedbackViewModal';
    modal.className = 'feedback-modal';
    modal.innerHTML = `
        <div class="feedback-modal-content">
            <div class="feedback-modal-header">
                <h3 class="feedback-modal-title">Feedback Details</h3>
                <button class="feedback-modal-close">&times;</button>
            </div>
            <div class="feedback-modal-body">
                <div class="feedback-meta">
                    <span class="feedback-from">From: <strong id="feedbackModalFrom">User Name</strong></span>
                    <span class="feedback-date" id="feedbackModalDate">Date</span>
                </div>
                <div class="feedback-content" id="feedbackModalContent">
                    Feedback content will appear here.
                </div>
            </div>
        </div>
    `;
    
    // Add the modal to the body
    document.body.appendChild(modal);
    
    // Add event listener to close button
    const closeBtn = modal.querySelector('.feedback-modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Function to remove all event handlers to prevent duplicates
function removeAllEventHandlers() {
    // Remove Add Document button event handlers
    const addDocumentBtn = document.getElementById('addDocumentBtn');
    if (addDocumentBtn) {
        // Create a clone without event listeners
        const newBtn = addDocumentBtn.cloneNode(true);
        if (addDocumentBtn.parentNode) {
            addDocumentBtn.parentNode.replaceChild(newBtn, addDocumentBtn);
        }
    }
    
    // Remove document list event handlers
    const documentsList = document.getElementById('documentsList');
    if (documentsList) {
        // Clear the list to remove any event handlers
        documentsList.innerHTML = '';
    }
    
    // Reset the global taskDocuments array
    taskDocuments = [];
}

// Make functions globally available
window.openTaskModal = openTaskModal;
window.closeTaskModal = closeTaskModal;
