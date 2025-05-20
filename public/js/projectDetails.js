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
    const taskPercentage = document.getElementById('percentageSlider')?.value || 0;
    const taskId = document.getElementById('taskId')?.value;
    
    console.log('Task data to save:', {
        taskId,
        taskDescription,
        taskStatus,
        taskAssignee,
        taskPercentage
    });
    
    // Submit the form to update the task on the server
    const form = document.getElementById('taskUpdateForm');
    if (form) {
        // Let the form submit normally to update the task on the server
        // The page will reload with updated data
        return true;
    } else {
        console.error('Task update form not found');
        alertify.error('Error updating task');
        return false;
    }
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

// Function to calculate and update project percentage based on task percentages
function updateProjectPercentage() {
    console.log('Calculating project percentage');
    
    // Get all task rows from the table
    const taskRows = document.querySelectorAll('.task-table tbody tr[data-task-id]');
    console.log('Found task rows:', taskRows.length);
    
    // If no tasks, set percentage to 0
    if (!taskRows || taskRows.length === 0) {
        console.log('No tasks found, setting project percentage to 0%');
        setProjectPercentage(0);
        return;
    }
    
    let totalPercentage = 0;
    let taskCount = 0;
    
    // Sum up all task percentages
    for (let i = 0; i < taskRows.length; i++) {
        const row = taskRows[i];
        if (row.cells && row.cells.length > 3) {
            // Remove the % symbol if present
            const percentageText = row.cells[3].textContent.replace('%', '').trim();
            const percentage = parseInt(percentageText) || 0;
            console.log(`Row ${i} percentage: ${percentage}%`);
            totalPercentage += percentage;
            taskCount++;
        }
    }
    
    // Calculate average percentage
    const averagePercentage = taskCount > 0 ? Math.round((totalPercentage / taskCount) * 100) / 100 : 0;
    console.log(`Project percentage calculated: ${averagePercentage}% (${totalPercentage} / ${taskCount})`);
    
    // Update the project percentage in the UI
    setProjectPercentage(averagePercentage);
}

// Function to update the project percentage display
function setProjectPercentage(percentage) {
    console.log('Setting project percentage to:', percentage);
    
    // Get the project percentage badge by ID
    const progressBadge = document.getElementById('projectPercentageBadge');
    
    if (!progressBadge) {
        console.error('Project progress badge not found');
        return;
    }
    
    // Format the percentage with 2 decimal places
    const formattedPercentage = percentage.toFixed(2);
    
    // Set the badge text directly
    progressBadge.innerHTML = formattedPercentage + '% Completed';
    
    // Update the badge class based on the percentage
    progressBadge.className = 'progress-badge';
    if (percentage >= 100) {
        progressBadge.classList.add('complete');
    } else if (percentage > 0) {
        progressBadge.classList.add('in-progress');
    } else {
        progressBadge.classList.add('pending');
    }
    
    console.log(`Project percentage display updated to ${formattedPercentage}%`);
}

// Add a global console log to verify the script is loaded
console.log('Project Details JS file loaded');

// Direct update function that doesn't rely on complex calculations
function directUpdatePercentage() {
    console.log('Directly updating project percentage');
    
    // Get the badge element
    const badge = document.getElementById('projectPercentageBadge');
    if (!badge) {
        console.error('Badge element not found!');
        return;
    }
    
    // Log the current HTML content of the badge
    console.log('Current badge HTML:', badge.innerHTML);
    
    // Get all task percentages from the table
    const percentages = [];
    const rows = document.querySelectorAll('.task-table tbody tr');
    console.log('Found rows:', rows.length);
    
    // Log the HTML of the table for debugging
    const table = document.querySelector('.task-table');
    if (table) {
        console.log('Table HTML (first 200 chars):', table.innerHTML.substring(0, 200));
    }
    
    // Check each row in detail
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        console.log(`Row ${i} HTML:`, row.outerHTML);
        
        if (row.cells && row.cells.length > 3) {
            // Get the percentage cell
            const cell = row.cells[3];
            console.log(`Row ${i} cell 3 HTML:`, cell.innerHTML);
            
            // Extract text and clean it
            const text = cell.textContent.trim().replace('%', '');
            console.log(`Row ${i} cleaned text:`, text);
            
            // Parse as integer
            const value = parseInt(text) || 0;
            console.log(`Row ${i} parsed value:`, value);
            
            // Add to percentages array
            percentages.push(value);
        } else {
            console.log(`Row ${i} has insufficient cells:`, row.cells ? row.cells.length : 'no cells');
        }
    }
    
    console.log('Collected percentages:', percentages);
    
    // Calculate average
    let total = 0;
    for (let i = 0; i < percentages.length; i++) {
        total += percentages[i];
    }
    
    const average = percentages.length > 0 ? total / percentages.length : 0;
    const formatted = average.toFixed(2);
    
    console.log(`Average percentage: ${formatted}% (${total}/${percentages.length})`);
    
    // Update the badge directly
    badge.innerHTML = formatted + '% Completed';
    
    // Update class
    badge.className = 'progress-badge';
    if (average >= 100) {
        badge.classList.add('complete');
    } else if (average > 0) {
        badge.classList.add('in-progress');
    } else {
        badge.classList.add('pending');
    }
    
    console.log('Badge updated to:', badge.innerHTML);
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired');
    
    // Try to update immediately
    directUpdatePercentage();
    
    // Also try after a delay
    setTimeout(directUpdatePercentage, 1000);
    
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
    
    // Calculate project percentage after task updates
    if (window.location.search.includes('updated=true')) {
        console.log('Task was updated, recalculating project percentage');
        updateProjectPercentage();
        
        // Remove the query parameter to avoid recalculating on page refresh
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }
    
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
