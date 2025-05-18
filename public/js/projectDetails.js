// Global function to open the task modal - accessible from inline onclick handlers
function openTaskModal(button) {
    console.log('openTaskModal called from inline handler');
    
    // Get the modal elements
    const modal = document.getElementById('updateTaskModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const percentageSlider = document.getElementById('percentageSlider');
    const percentageValue = document.getElementById('percentageValue');
    
    if (!modal || !modalOverlay) {
        console.error('Modal elements not found');
        return;
    }
    
    // Get task data from the row
    const row = button.closest('tr');
    if (!row || !row.cells || row.cells.length < 4) {
        console.error('Invalid row structure:', row);
        return;
    }
    
    const taskName = row.cells[0].textContent.trim();
    const taskDescription = row.cells[1].textContent.trim();
    const statusBadge = row.cells[2].querySelector('.status-badge');
    const taskStatus = statusBadge ? statusBadge.textContent.trim() : '';
    const taskPercentage = parseInt(row.cells[3].textContent) || 0;
    
    console.log('Task data:', { taskName, taskDescription, taskStatus, taskPercentage });
    
    // Populate modal with task data
    if (document.getElementById('taskDescription')) {
        document.getElementById('taskDescription').value = taskDescription;
    }
    
    // Set the status dropdown
    const statusSelect = document.getElementById('taskStatus');
    if (statusSelect) {
        for (let i = 0; i < statusSelect.options.length; i++) {
            if (statusSelect.options[i].text === taskStatus) {
                statusSelect.selectedIndex = i;
                break;
            }
        }
    }
    
    // Set the percentage slider
    if (percentageSlider && percentageValue) {
        percentageSlider.value = taskPercentage;
        percentageValue.textContent = taskPercentage + '%';
    }
    
    // Show the modal
    modal.style.display = 'block';
    modalOverlay.style.display = 'block';
    console.log('Modal should be visible now');
}

// Global function to save task changes - called from the Save Changes button
function saveTaskChanges() {
    console.log('saveTaskChanges called');
    
    // Get form values
    const taskDescription = document.getElementById('taskDescription')?.value || '';
    const taskStatus = document.getElementById('taskStatus')?.value || '';
    const taskAssignee = document.getElementById('taskAssignee')?.value || '';
    const taskPercentage = document.getElementById('percentageDropdown')?.value || 0;
    
    // Get document URLs
    const documentUrl1 = document.getElementById('documentUrl1')?.value || '';
    const documentUrl2 = document.getElementById('documentUrl2')?.value || '';
    
    console.log('Task data to save:', {
        taskDescription,
        taskStatus,
        taskAssignee,
        taskPercentage,
        documentUrl1,
        documentUrl2
    });
    
    // In a real implementation, this would send data to the server
    // For now, just show a success message using alertify
    alertify.success('Task updated successfully!');
    
    // Close the modal
    closeTaskModal();
}

// Global function to close the task modal - accessible from inline onclick handlers
function closeTaskModal() {
    console.log('closeTaskModal called');
    
    const modal = document.getElementById('updateTaskModal');
    const modalOverlay = document.getElementById('modalOverlay');
    
    if (modal && modalOverlay) {
        modal.style.display = 'none';
        modalOverlay.style.display = 'none';
        console.log('Modal hidden');
    } else {
        console.error('Modal elements not found for closing');
    }
}

// Original openTaskModal function for reference - keeping for compatibility
function openTaskModal(button) {
    console.log('openTaskModal called from inline handler');
    
    // Get the modal elements
    const modal = document.getElementById('updateTaskModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const percentageSlider = document.getElementById('percentageSlider');
    const percentageValue = document.getElementById('percentageValue');
    
    if (!modal || !modalOverlay) {
        console.error('Modal elements not found');
        return;
    }
    
    // Get task data from the row
    const row = button.closest('tr');
    if (!row || !row.cells || row.cells.length < 4) {
        console.error('Invalid row structure:', row);
        return;
    }
    
    const taskName = row.cells[0].textContent.trim();
    const taskDescription = row.cells[1].textContent.trim();
    const statusBadge = row.cells[2].querySelector('.status-badge');
    const taskStatus = statusBadge ? statusBadge.textContent.trim() : '';
    const taskPercentage = parseInt(row.cells[3].textContent) || 0;
    
    console.log('Task data:', { taskName, taskDescription, taskStatus, taskPercentage });
    
    // Populate modal with task data
    if (document.getElementById('taskDescription')) {
        document.getElementById('taskDescription').value = taskDescription;
    }
    
    // Set the status dropdown
    const statusSelect = document.getElementById('taskStatus');
    if (statusSelect) {
        for (let i = 0; i < statusSelect.options.length; i++) {
            if (statusSelect.options[i].text === taskStatus) {
                statusSelect.selectedIndex = i;
                break;
            }
        }
    }
    
    // Set the percentage slider
    if (percentageSlider && percentageValue) {
        percentageSlider.value = taskPercentage;
        percentageValue.textContent = taskPercentage + '%';
    }
    
    // Show the modal
    modal.style.display = 'block';
    modalOverlay.style.display = 'block';
    console.log('Modal should be visible now');
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Project Details JS loaded');
    
    // Project Form Submit Handler
    const projectForm = document.querySelector('form');
    if (projectForm) {
        projectForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alertify.success('Project changes saved successfully!');
        });
    }

    // Modal Elements
    const modal = document.getElementById('updateTaskModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const closeModalBtn = document.querySelector('.close-modal');
    const cancelBtn = document.getElementById('cancelTaskUpdate');
    const saveChangesBtn = document.getElementById('saveTaskChanges');
    const percentageSlider = document.getElementById('percentageSlider');
    const percentageValue = document.getElementById('percentageValue');
    
    console.log('Modal elements:', { 
        modal: !!modal, 
        overlay: !!modalOverlay, 
        closeBtn: !!closeModalBtn,
        cancelBtn: !!cancelBtn,
        saveBtn: !!saveChangesBtn
    });
    
    // Direct approach for edit buttons
    // This is more reliable than using querySelectorAll with event listeners
    const setupEditButtons = function() {
        const editButtons = document.querySelectorAll('.btn-icon[title="Edit"]');
        console.log('Found edit buttons:', editButtons.length);
        
        editButtons.forEach(function(button) {
            // Remove any existing click handlers
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add new click handler
            newButton.onclick = function(event) {
                event.preventDefault();
                event.stopPropagation();
                console.log('Edit button clicked');
                
                // Get task data from the row
                const row = this.closest('tr');
                console.log('Found row:', row);
                
                if (!row || !row.cells || row.cells.length < 4) {
                    console.error('Invalid row structure:', row);
                    return false;
                }
                
                const taskName = row.cells[0].textContent.trim();
                const taskDescription = row.cells[1].textContent.trim();
                const statusBadge = row.cells[2].querySelector('.status-badge');
                const taskStatus = statusBadge ? statusBadge.textContent.trim() : '';
                const taskPercentage = parseInt(row.cells[3].textContent) || 0;
                
                console.log('Task data:', { taskName, taskDescription, taskStatus, taskPercentage });
                
                // Populate modal with task data
                if (document.getElementById('taskDescription')) {
                    document.getElementById('taskDescription').value = taskDescription;
                }
                
                // Set the status dropdown
                const statusSelect = document.getElementById('taskStatus');
                if (statusSelect) {
                    for (let i = 0; i < statusSelect.options.length; i++) {
                        if (statusSelect.options[i].text === taskStatus) {
                            statusSelect.selectedIndex = i;
                            break;
                        }
                    }
                }
                
                // Set the percentage slider
                if (percentageSlider && percentageValue) {
                    percentageSlider.value = taskPercentage;
                    percentageValue.textContent = taskPercentage + '%';
                }
                
                // Show the modal - using direct DOM manipulation
                if (modal && modalOverlay) {
                    modal.style.display = 'block';
                    modalOverlay.style.display = 'block';
                    console.log('Modal should be visible now');
                } else {
                    console.error('Modal or overlay not found');
                }
                
                return false;
            };
        });
    };
    
    // Run setup immediately
    setupEditButtons();
    
    // Also run after a short delay to ensure DOM is fully processed
    setTimeout(setupEditButtons, 500);
    
        // Use the global closeTaskModal function for consistency
    
    // Close modal when close button is clicked
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Close button clicked');
            hideModal();
        });
    }
    
    // Close modal when cancel button is clicked
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Cancel button clicked');
            hideModal();
        });
    }
    
    // Close modal when clicking outside the modal
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function() {
            console.log('Overlay clicked');
            hideModal();
        });
    }
    
    // Handle percentage dropdown
    const percentageDropdown = document.getElementById('percentageDropdown');
    if (percentageDropdown) {
        // No need for additional event listeners as select elements handle changes natively
    }
    
    // Handle save changes button
    if (saveChangesBtn) {
        saveChangesBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Save changes button clicked');
            alertify.success('Task updated successfully!');
            hideModal();
        });
    }
    
    // Handle document URL buttons
    const addUrlBtn = document.querySelector('.btn-add-url');
    const removeUrlBtns = document.querySelectorAll('.btn-remove-url');
    
    if (addUrlBtn) {
        addUrlBtn.addEventListener('click', function() {
            alertify.info('Add URL functionality will be implemented in the backend phase.');
        });
    }
    
    if (removeUrlBtns.length > 0) {
        removeUrlBtns.forEach(button => {
            button.addEventListener('click', function() {
                alertify.info('Remove URL functionality will be implemented in the backend phase.');
            });
        });
    }
});
