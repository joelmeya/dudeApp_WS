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
