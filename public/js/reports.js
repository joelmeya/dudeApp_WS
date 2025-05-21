// Reports page sorting functionality

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Reports.js loaded');
    
    // Get table element
    const table = document.querySelector('.data-table');
    if (!table) {
        console.error('Table not found');
        return;
    }
    
    // Add click event listeners to sortable column headers
    const sortableColumns = table.querySelectorAll('th.sortable');
    console.log('Found sortable columns:', sortableColumns.length);
    
    sortableColumns.forEach((header, index) => {
        console.log('Adding click listener to column:', index);
        
        // Make sure the entire header is clickable
        header.style.cursor = 'pointer';
        
        header.addEventListener('click', function() {
            console.log('Column clicked:', index);
            const columnIndex = Array.from(header.parentNode.children).indexOf(header);
            console.log('Column index:', columnIndex);
            const isAscending = header.classList.contains('sort-asc');
            
            // Toggle sort direction
            sortableColumns.forEach(col => {
                col.classList.remove('sort-asc', 'sort-desc');
            });
            
            if (isAscending) {
                header.classList.add('sort-desc');
                sortTable(table, columnIndex, false);
            } else {
                header.classList.add('sort-asc');
                sortTable(table, columnIndex, true);
            }
        });
    });
});

// Function to open the tasks modal
function openTasksModal(projectId, projectName) {
    // Set the modal title with the project name
    document.getElementById('projectTasksTitle').textContent = `${projectName} - Tasks`;
    
    // Set the link to view full project details
    const detailsLink = document.getElementById('viewProjectDetailsLink');
    detailsLink.href = `/project-details/${projectId}`;
    
    // Show the modal and overlay
    document.getElementById('projectTasksModal').style.display = 'block';
    document.getElementById('modalOverlay').style.display = 'block';
    
    // Fetch tasks for this project
    fetchProjectTasks(projectId);
}

// Function to close the tasks modal
function closeTasksModal() {
    document.getElementById('projectTasksModal').style.display = 'none';
    document.getElementById('modalOverlay').style.display = 'none';
}

// Function to fetch project tasks from the server
function fetchProjectTasks(projectId) {
    // Show loading state
    document.getElementById('taskTableBody').innerHTML = `
        <tr>
            <td colspan="4" class="text-center">
                <div class="loading-spinner"></div>
                <p>Loading tasks...</p>
            </td>
        </tr>
    `;
    
    // Fetch tasks data from the server
    fetch(`/reports/project-tasks/${projectId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            renderTasksTable(data.tasks);
        })
        .catch(error => {
            console.error('Error fetching tasks:', error);
            document.getElementById('taskTableBody').innerHTML = `
                <tr>
                    <td colspan="4" class="text-center error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Error loading tasks. Please try again.</p>
                    </td>
                </tr>
            `;
        });
}

// Function to render the tasks table with the fetched data
function renderTasksTable(tasks) {
    const taskTableBody = document.getElementById('taskTableBody');
    
    if (!tasks || tasks.length === 0) {
        taskTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">No tasks found for this project</td>
            </tr>
        `;
        return;
    }
    
    // Generate the HTML for each task row
    const tasksHtml = tasks.map(task => {
        // Determine status class
        let statusClass = 'new';
        if (task.Status) {
            const status = task.Status.toLowerCase();
            if (status === 'completed') statusClass = 'complete';
            else if (status === 'ongoing') statusClass = 'ongoing';
            else if (status === 'for review') statusClass = 'review';
            else if (status === 'cancelled') statusClass = 'cancelled';
        }
        
        return `
            <tr data-task-id="${task.TaskID}">
                <td>${task.Task_Name}</td>
                <td>${task.Description || ''}</td>
                <td>
                    <span class="status-badge ${statusClass}">${task.Status || 'New'}</span>
                </td>
                <td>${task.Completion_percentage || 0}%</td>
            </tr>
        `;
    }).join('');
    
    taskTableBody.innerHTML = tasksHtml;
}

// Function to sort table
function sortTable(table, columnIndex, ascending) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    // Sort the rows
    rows.sort((rowA, rowB) => {
        // Get the text content of the cells to compare
        let cellA = rowA.cells[columnIndex].textContent.trim();
        let cellB = rowB.cells[columnIndex].textContent.trim();
        
        // Special handling for status column (extract text from status badge)
        if (rowA.cells[columnIndex].querySelector('.status-badge')) {
            cellA = rowA.cells[columnIndex].querySelector('.status-badge').textContent.trim();
            cellB = rowB.cells[columnIndex].querySelector('.status-badge').textContent.trim();
        }
        
        // Compare the values
        if (cellA < cellB) {
            return ascending ? -1 : 1;
        }
        if (cellA > cellB) {
            return ascending ? 1 : -1;
        }
        return 0;
    });
    
    // Remove existing rows
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }
    
    // Add sorted rows back to the table
    rows.forEach(row => {
        tbody.appendChild(row);
    });
}
