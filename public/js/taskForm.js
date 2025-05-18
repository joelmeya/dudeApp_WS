document.addEventListener('DOMContentLoaded', function() {
    console.log('Task Form JS loaded');
    
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
    
    // Initialize event listeners for document buttons
    initializeDocumentButtons();
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
        const taskId = button.getAttribute('data-task-id') || '1';
        const taskNameText = row.cells[0].textContent.trim();
        const taskDescription = row.cells[1].textContent.trim();
        const statusBadge = row.cells[2].querySelector('.status-badge');
        const taskStatus = statusBadge ? statusBadge.textContent.trim() : 'New';
        const taskPercentage = parseInt(row.cells[3].textContent) || 0;
        
        console.log('Task data extracted:', { 
            taskId, 
            taskNameText, 
            taskStatus, 
            taskPercentage 
        });
        
        // Set the modal title
        const modalTitle = document.getElementById('taskModalTitle');
        if (modalTitle) {
            modalTitle.textContent = taskNameText;
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

// Make functions globally available
window.openTaskModal = openTaskModal;
window.closeTaskModal = closeTaskModal;
