/**
 * Enhanced Task Modal Functionality
 * This script handles the task modal in the project details page
 * It ensures proper display of task name and description in the modal title
 * and manages all form interactions.
 */

// Global variables
let currentTaskId = null;
let taskDocuments = [];

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', function() {
    console.log('Task Modal JS loaded');
    initializeTaskModal();
    setupEventListeners();
    checkUrlParameters();
});

/**
 * Initialize the task modal by hiding it on page load
 */
function initializeTaskModal() {
    // Hide the modal on page load
    const modal = document.getElementById('updateTaskModal');
    const modalOverlay = document.getElementById('modalOverlay');
    
    if (modal) modal.style.display = 'none';
    if (modalOverlay) modalOverlay.style.display = 'none';
    
    // Make functions globally available
    window.openTaskModal = openTaskModal;
    window.closeTaskModal = closeTaskModal;
}

/**
 * Set up all event listeners for the task modal
 */
function setupEventListeners() {
    // Set up event listeners for the modal close buttons
    const closeButtons = document.querySelectorAll('.close-modal, .btn-secondary[onclick="closeTaskModal()"]');
    closeButtons.forEach(button => {
        // Remove existing event listeners to prevent duplicates
        const newButton = button.cloneNode(true);
        if (button.parentNode) {
            button.parentNode.replaceChild(newButton, button);
        }
        
        // Add new event listener
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            closeTaskModal();
        });
    });
    
    // Set up event listener for modal overlay click
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                closeTaskModal();
            }
        });
    }
    
    // Handle form submission
    const taskForm = document.getElementById('taskUpdateForm');
    if (taskForm) {
        taskForm.addEventListener('submit', function(e) {
            // Form will submit normally, this is just for any pre-submission processing
            console.log('Submitting task form');
        });
    }
    
    // Set up status dropdown event listener
    const statusDropdown = document.getElementById('taskStatus');
    if (statusDropdown) {
        statusDropdown.addEventListener('change', function() {
            // Update color based on selection
            this.style.color = '#333';
        });
    }
    
    // Set up percentage dropdown event listener
    const percentageDropdown = document.getElementById('percentageDropdown');
    if (percentageDropdown) {
        percentageDropdown.addEventListener('change', function() {
            // Update color based on selection
            this.style.color = '#333';
        });
    }
}

/**
 * Open the task modal and populate it with task data
 * @param {HTMLElement} button - The button that triggered the modal
 */
function openTaskModal(button) {
    console.log('Opening task modal');
    
    // Get the modal elements
    const modal = document.getElementById('updateTaskModal');
    const modalOverlay = document.getElementById('modalOverlay');
    
    if (!modal || !modalOverlay) {
        console.error('Modal elements not found');
        return;
    }
    
    // Get task data from the row
    const row = button.closest('tr');
    if (!row) {
        console.error('Could not find parent row');
        return;
    }
    
    // Get task ID and data
    const taskId = row.getAttribute('data-task-id');
    const taskName = row.cells[0].textContent.trim();
    const taskDescription = row.cells[1].textContent.trim();
    const statusBadge = row.cells[2].querySelector('.status-badge');
    const taskStatus = statusBadge ? statusBadge.textContent.trim() : 'New';
    const taskPercentageText = row.cells[3].textContent.trim();
    const taskPercentage = parseInt(taskPercentageText) || 0;
    
    console.log('Task data:', { taskId, taskName, taskDescription, taskStatus, taskPercentage });
    
    // Store current task ID globally
    currentTaskId = taskId;
    
    // Set the task ID in the form
    const taskIdField = document.getElementById('taskId');
    if (taskIdField) {
        taskIdField.value = taskId;
    }
    
    // Set the modal title with task name only
    const modalTitle = document.getElementById('taskModalTitle');
    if (modalTitle) {
        modalTitle.innerHTML = `
            <div class="task-title-container">
                <div class="task-title-main">Task Details: ${taskName}</div>
            </div>
        `;
        console.log('Updated modal title with task name only');
    }
    
    // Set the status dropdown
    const statusSelect = document.getElementById('taskStatus');
    if (statusSelect) {
        for (let i = 0; i < statusSelect.options.length; i++) {
            if (statusSelect.options[i].text.trim() === taskStatus) {
                statusSelect.selectedIndex = i;
                statusSelect.style.color = '#333'; // Ensure text is visible
                break;
            }
        }
    }
    
    // Set the percentage dropdown
    const percentageDropdown = document.getElementById('percentageDropdown');
    if (percentageDropdown) {
        // Find the closest percentage option (0, 25, 50, 75, 100)
        const percentageOptions = [0, 25, 50, 75, 100];
        let closestPercentage = percentageOptions.reduce((prev, curr) => {
            return (Math.abs(curr - taskPercentage) < Math.abs(prev - taskPercentage) ? curr : prev);
        });
        
        // Set the selected option
        for (let i = 0; i < percentageDropdown.options.length; i++) {
            if (parseInt(percentageDropdown.options[i].value) === closestPercentage) {
                percentageDropdown.selectedIndex = i;
                percentageDropdown.style.color = '#333'; // Ensure text is visible
                break;
            }
        }
    }
    
    // Show the modal
    modal.style.display = 'block';
    modalOverlay.style.display = 'block';
    
    // Ensure modal is properly positioned
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
}

/**
 * Close the task modal
 */
function closeTaskModal() {
    console.log('Closing task modal');
    
    const modal = document.getElementById('updateTaskModal');
    const modalOverlay = document.getElementById('modalOverlay');
    
    if (modal) modal.style.display = 'none';
    if (modalOverlay) modalOverlay.style.display = 'none';
    
    // Reset current task ID
    currentTaskId = null;
}

/**
 * Check URL parameters for success or error messages
 */
function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Show success message if present
    if (urlParams.get('success') === 'true') {
        if (typeof alertify !== 'undefined') {
            alertify.success('Task updated successfully!');
        } else {
            console.log('Task updated successfully!');
        }
        // Remove the success parameter from URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }
    
    // Show error message if present
    const errorMsg = urlParams.get('error');
    if (errorMsg) {
        if (typeof alertify !== 'undefined') {
            alertify.error(errorMsg);
        } else {
            console.error('Error:', errorMsg);
        }
        // Remove the error parameter from URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }
}
