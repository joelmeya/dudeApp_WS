/**
 * Task Feedback Functionality
 * Handles the feedback form and feedback viewing in the Task Details modal
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Feedback Form JS loaded');
    // We'll initialize the feedback form when the task modal is opened
});

/**
 * Initialize the feedback form and related functionality
 */
function initializeFeedbackForm() {
    // Get DOM elements
    const showFeedbackFormBtn = document.getElementById('showFeedbackForm');
    const feedbackFormContainer = document.getElementById('feedbackFormContainer');
    const cancelFeedbackBtn = document.getElementById('cancelFeedback');
    const submitFeedbackBtn = document.getElementById('submitFeedback');
    const addFirstFeedbackBtn = document.getElementById('addFirstFeedback');
    const feedbackTable = document.getElementById('feedbackTable');
    const noFeedbacksMessage = document.getElementById('noFeedbacksMessage');
    const viewFeedbackBtns = document.querySelectorAll('.view-feedback');
    
    // Check if there are any feedbacks and show/hide elements accordingly
    checkFeedbacksExistence();
    
    // Add event listeners
    if (showFeedbackFormBtn) {
        showFeedbackFormBtn.addEventListener('click', showFeedbackForm);
    }
    
    if (cancelFeedbackBtn) {
        cancelFeedbackBtn.addEventListener('click', hideFeedbackForm);
    }
    
    if (submitFeedbackBtn) {
        submitFeedbackBtn.addEventListener('click', submitFeedback);
    }
    
    if (addFirstFeedbackBtn) {
        addFirstFeedbackBtn.addEventListener('click', showFeedbackForm);
    }
    
    // Add event listeners to view feedback buttons
    viewFeedbackBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const feedbackId = this.getAttribute('data-feedback-id');
            viewFeedback(feedbackId);
        });
    });
    
    // Create feedback modal if it doesn't exist
    createFeedbackModal();
}

/**
 * Check if there are any feedbacks and show/hide elements accordingly
 */
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

/**
 * Show the feedback form
 */
function showFeedbackForm() {
    const feedbackFormContainer = document.getElementById('feedbackFormContainer');
    const feedbackListContainer = document.getElementById('feedbackListContainer');
    
    if (feedbackFormContainer) {
        feedbackFormContainer.style.display = 'block';
    }
    
    // Clear any previous input
    const feedbackText = document.getElementById('feedbackText');
    if (feedbackText) feedbackText.value = '';
    
    // Focus on the feedback text area
    if (feedbackText) feedbackText.focus();
}

/**
 * Hide the feedback form
 */
function hideFeedbackForm() {
    const feedbackFormContainer = document.getElementById('feedbackFormContainer');
    
    if (feedbackFormContainer) {
        feedbackFormContainer.style.display = 'none';
    }
}

/**
 * Submit feedback (placeholder for backend integration)
 */
function submitFeedback() {
    const feedbackText = document.getElementById('feedbackText');
    
    if (!feedbackText || !feedbackText.value.trim()) {
        alertify.error('Please enter your feedback');
        return;
    }
    
    // Get the feedback data
    const feedbackData = {
        text: feedbackText.value.trim(),
        taskId: document.getElementById('taskId').value,
        // In a real implementation, the user info would come from the session
        userName: 'Current User', // Placeholder - will be replaced by actual user name
        date: new Date().toISOString()
    };
    
    console.log('Feedback data to submit:', feedbackData);
    
    // Show loading message
    alertify.message('Submitting feedback...');
    
    // This is a placeholder for the actual backend submission
    // In a real implementation, you would send this data to the server
    setTimeout(() => {
        // Simulate successful submission
        alertify.success('Feedback submitted successfully');
        
        // Add the feedback to the table (for demo purposes)
        addFeedbackToTable({
            id: new Date().getTime(), // Generate a temporary ID
            from: feedbackData.userName,
            date: new Date().toLocaleDateString(),
            text: feedbackData.text
        });
        
        // Hide the form
        hideFeedbackForm();
        
        // Check if there are any feedbacks now
        checkFeedbacksExistence();
    }, 1000);
}

/**
 * Add a feedback to the table
 */
function addFeedbackToTable(feedback) {
    const feedbackTableBody = document.getElementById('feedbackTableBody');
    
    if (!feedbackTableBody) return;
    
    // Create a new row
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${feedback.from}</td>
        <td>${feedback.date}</td>
        <td class="feedback-preview">${feedback.text}</td>
        <td>
            <button type="button" class="btn-sm btn-secondary view-feedback" data-feedback-id="${feedback.id}">View</button>
        </td>
    `;
    
    // Add event listener to the view button
    const viewBtn = row.querySelector('.view-feedback');
    if (viewBtn) {
        viewBtn.addEventListener('click', function() {
            viewFeedback(feedback.id);
        });
    }
    
    // Add the row to the table
    feedbackTableBody.prepend(row); // Add at the top
    
    // Show the table if it was hidden
    const feedbackTable = document.getElementById('feedbackTable');
    const noFeedbacksMessage = document.getElementById('noFeedbacksMessage');
    
    if (feedbackTable) feedbackTable.style.display = 'table';
    if (noFeedbacksMessage) noFeedbacksMessage.style.display = 'none';
}

/**
 * Create the feedback modal if it doesn't exist
 */
function createFeedbackModal() {
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
        closeBtn.addEventListener('click', closeFeedbackModal);
    }
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeFeedbackModal();
        }
    });
}

/**
 * View a feedback (placeholder for backend integration)
 */
function viewFeedback(feedbackId) {
    console.log('Viewing feedback with ID:', feedbackId);
    
    // In a real implementation, you would fetch the feedback details from the server
    // For now, we'll use the data from the table row
    const feedbackRow = document.querySelector(`.view-feedback[data-feedback-id="${feedbackId}"]`).closest('tr');
    
    if (!feedbackRow) {
        alertify.error('Feedback not found');
        return;
    }
    
    // Get the feedback data from the row
    const from = feedbackRow.cells[0].textContent;
    const date = feedbackRow.cells[1].textContent;
    const text = feedbackRow.cells[2].textContent;
    
    // Update the modal content
    document.getElementById('feedbackModalFrom').textContent = from;
    document.getElementById('feedbackModalDate').textContent = date;
    document.getElementById('feedbackModalContent').textContent = text;
    
    // Show the modal
    const modal = document.getElementById('feedbackViewModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

/**
 * Close the feedback modal
 */
function closeFeedbackModal() {
    const modal = document.getElementById('feedbackViewModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Make functions available globally
window.showFeedbackForm = showFeedbackForm;
window.hideFeedbackForm = hideFeedbackForm;
window.submitFeedback = submitFeedback;
window.viewFeedback = viewFeedback;
window.closeFeedbackModal = closeFeedbackModal;
