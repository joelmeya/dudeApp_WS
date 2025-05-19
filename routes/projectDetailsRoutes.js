import express from 'express';

const router = express.Router();

// Middleware to check if user is logged in
const requireLogin = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/');
    }
};

// Test login route for debugging
router.get('/test-login', (req, res) => {
    // Set a test user session
    req.session.user = {
        email: 'test@example.com',
        name: 'Test User',
        role: 'Admin',
        fullName: 'Test User'
    };
    
    // Save session and redirect to project details
    req.session.save((err) => {
        if (err) {
            console.error('Session save error:', err);
            return res.status(500).send('Error setting session');
        }
        console.log('Test login successful, session set:', req.session.user);
        res.redirect('/project-details/7');
    });
});

// Project Details page route
router.get('/:id', requireLogin, async (req, res) => {
    try {
        // Log session information for debugging
        console.log('Session user in project details route:', req.session.user);
        console.log('Session ID:', req.session.id);
        
        const projectId = req.params.id;
        
        // Import SQL module
        const { sql } = await import('../db/sql.js');
        
        // Fetch project details by ID
        const projectResult = await sql.query`
            SELECT 
                ProjectID,
                Project_Name,
                Project_Type,
                Details,
                Date,
                Status,
                Acc_URL,
                Created_AT
            FROM Projects
            WHERE ProjectID = ${projectId}
        `;
        
        // Check if project exists
        if (projectResult.recordset.length === 0) {
            return res.status(404).render('error', {
                message: 'Project not found',
                error: { status: 404, stack: 'Project with ID ' + projectId + ' not found' },
                user: req.session.user
            });
        }
        
        const project = projectResult.recordset[0];
        
        // Ensure status is properly formatted for display
        if (project.Status) {
            // Normalize status to uppercase for consistent comparison
            project.Status = project.Status.trim();
            console.log('Status after normalization:', project.Status);
        }
        
        // Debug log to check project data
        console.log('Project data from database:', {
            id: project.ProjectID,
            name: project.Project_Name,
            type: project.Project_Type,
            status: project.Status,
            statusType: typeof project.Status,
            statusLength: project.Status ? project.Status.length : 0,
            details: project.Details ? project.Details.substring(0, 50) + '...' : null
        });
        
        // Fetch all active users for task assignment
        const usersResult = await sql.query`
            SELECT 
                id,
                name,
                role
            FROM tbl_users
            WHERE status = 'active'
            ORDER BY name ASC
        `;
        
        const users = usersResult.recordset;
        
        // Fetch tasks for this project
        const tasksResult = await sql.query`
            SELECT 
                Task_id AS TaskID,
                Task_Name,
                Description,
                Status,
                Completion_percentage
            FROM Tasks
            WHERE ProjectID = ${projectId}
            ORDER BY Task_id ASC
        `;
        
        const tasks = tasksResult.recordset;
        console.log(`Fetched ${tasks.length} tasks for project ${projectId}`);
        
        // Render the project details page with the fetched data
        res.render('projectDetails', { 
            user: req.session.user, 
            page: 'projectDetails',
            projectId: projectId,
            project: project, // Pass project data to the template
            tasks: tasks, // Pass tasks to the template
            formSuccess: req.query.success === 'true',
            formError: req.query.error,
            users: users // Pass users to the template
        });
    } catch (err) {
        console.error('Error loading project details:', err);
        res.status(500).render('error', { 
            message: 'Error loading project details',
            error: err,
            user: req.session.user
        });
    }
});

// Route to update project details
router.post('/:id/update-status', requireLogin, async (req, res) => {
    try {
        const projectId = req.params.id;
        const { status, projectName, details, targetDate } = req.body;
        
        console.log('Project update data received:', {
            projectId,
            status,
            projectName,
            details,
            targetDate
        });
        
        // Validate status (case insensitive)
        const validStatuses = ['NEW', 'FOR REVIEW', 'ONGOING', 'COMPLETED', 'CANCELLED'];
        if (!validStatuses.includes(status.toUpperCase())) {
            return res.redirect(`/project-details/${projectId}?error=Invalid status value`);
        }
        
        // Always normalize status to uppercase for consistency in the database
        // This ensures the dropdown will always work correctly regardless of case
        const normalizedStatus = status.toUpperCase();
        
        // Validate project name
        if (!projectName || projectName.trim() === '') {
            return res.redirect(`/project-details/${projectId}?error=Project name cannot be empty`);
        }
        
        // Update project in the database
        const { sql } = await import('../db/sql.js');
        await sql.query`
            UPDATE Projects
            SET Status = ${normalizedStatus},
                Project_Name = ${projectName},
                Details = ${details || null},
                Date = ${targetDate || null}
            WHERE ProjectID = ${projectId}
        `;
        
        // Redirect back with success message
        res.redirect(`/project-details/${projectId}?success=true`);
    } catch (err) {
        console.error('Error updating project status:', err);
        res.redirect(`/project-details/${req.params.id}?error=Failed to update project status`);
    }
});

// Route to handle task update form submission
router.post('/:id/update-task', requireLogin, async (req, res) => {
    try {
        const projectId = req.params.id;
        const taskId = req.body.taskId;
        const { taskStatus, percentageDropdown, assignedUsersIds, taskDocumentsData } = req.body;
        
        console.log('Task update data received:', {
            projectId,
            taskId,
            taskStatus,
            percentageCompleted: percentageDropdown,
            assignedUsersIds
        });
        
        // Process assigned users if present
        if (assignedUsersIds) {
            const assignedUserIdArray = assignedUsersIds.split(',').filter(id => id.trim() !== '');
            console.log('Assigned user IDs:', assignedUserIdArray);
            
            // Get the full name of the logged-in user (for assigned_by field)
            const assignedBy = req.session.user.name;
            
            // Get the SQL connection
            const { sql } = await import('../db/sql.js');
            
            try {
                // First, ensure the task_assignedUsers table exists
                try {
                    await sql.query`
                        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'task_assignedUsers')
                        BEGIN
                            CREATE TABLE task_assignedUsers (
                                id INT IDENTITY(1,1) PRIMARY KEY,
                                task_id INT NOT NULL,
                                user_id INT NOT NULL,
                                assigned_by NVARCHAR(100) NOT NULL,
                                assigned_date DATETIME DEFAULT GETDATE()
                            )
                        END
                    `;
                    console.log('Ensured task_assignedUsers table exists');
                } catch (tableError) {
                    console.error('Error ensuring task_assignedUsers table exists:', tableError);
                }
                
                // Delete existing task assignments for this task
                await sql.query`DELETE FROM task_assignedUsers WHERE task_id = ${taskId}`;
                console.log('Deleted existing task assignments');
                
                // Insert new task assignments for each user ID
                for (const userId of assignedUserIdArray) {
                    await sql.query`
                        INSERT INTO task_assignedUsers (task_id, user_id, assigned_by)
                        VALUES (${taskId}, ${userId}, ${assignedBy})
                    `;
                    console.log(`Added user ID ${userId} to task ID ${taskId}`);
                }
            } catch (assignmentError) {
                console.error('Error updating task assignments:', assignmentError);
                // Continue with the rest of the task update even if assignments fail
            }
        }
        
        // Process task documents if present
        if (taskDocumentsData) {
            try {
                const documents = JSON.parse(taskDocumentsData);
                console.log('Task documents:', documents);
                
                // Get the full name of the logged-in user (for Created_By field)
                const createdBy = req.session.user.name;
                
                // Get the SQL connection
                const { sql } = await import('../db/sql.js');
                
                try {
                    // First, ensure the Task_Documents table exists
                    try {
                        await sql.query`
                            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Task_Documents')
                            BEGIN
                                CREATE TABLE Task_Documents (
                                    id INT IDENTITY(1,1) PRIMARY KEY,
                                    task_id INT NOT NULL,
                                    DocumentName NVARCHAR(255) NOT NULL,
                                    DocURL NVARCHAR(MAX) NOT NULL,
                                    Created_By NVARCHAR(100) NOT NULL,
                                    Created_At DATETIME DEFAULT GETDATE()
                                )
                            END
                        `;
                        console.log('Ensured Task_Documents table exists');
                    } catch (tableError) {
                        console.error('Error ensuring Task_Documents table exists:', tableError);
                    }
                    
                    // Delete existing documents for this task
                    await sql.query`DELETE FROM Task_Documents WHERE task_id = ${taskId}`;
                    console.log('Deleted existing task documents');
                    
                    // Insert new documents
                    for (const doc of documents) {
                        await sql.query`
                            INSERT INTO Task_Documents (task_id, DocumentName, DocURL, Created_By)
                            VALUES (${taskId}, ${doc.name}, ${doc.url}, ${createdBy})
                        `;
                        console.log(`Added document '${doc.name}' to task ID ${taskId}`);
                    }
                } catch (docError) {
                    console.error('Error updating task documents:', docError);
                    // Continue with the rest of the task update even if document updates fail
                }
            } catch (parseError) {
                console.error('Error parsing task documents data:', parseError);
            }
        }
        
        // Validate task status
        const validTaskStatuses = ['New', 'Ongoing', 'Completed', 'For Review', 'Cancelled'];
        if (!validTaskStatuses.includes(taskStatus)) {
            return res.redirect(`/project-details/${projectId}?error=Invalid task status value`);
        }
        
        // Validate percentage
        const percentage = parseInt(percentageDropdown) || 0;
        if (percentage < 0 || percentage > 100) {
            return res.redirect(`/project-details/${projectId}?error=Percentage must be between 0 and 100`);
        }
        
        // Update task in the database
        const { sql } = await import('../db/sql.js');
        await sql.query`
            UPDATE Tasks
            SET Status = ${taskStatus},
                Completion_percentage = ${percentage}
            WHERE Task_id = ${taskId}
        `;
        
        console.log('Task updated successfully:', {
            taskId,
            status: taskStatus,
            percentage
        });
        
        res.redirect(`/project-details/${projectId}?success=true`);
    } catch (err) {
        console.error('Error updating task:', err);
        res.redirect(`/project-details/${req.params.id}?error=Failed to update task`);
    }
});

// API endpoint to get documents for a task
router.get('/:projectId/tasks/:taskId/documents', requireLogin, async (req, res) => {
    try {
        const taskId = req.params.taskId;
        
        console.log(`Fetching documents for task ID ${taskId}`);
        
        // Fetch documents from the database
        const { sql } = await import('../db/sql.js');
        
        try {
            // Query to fetch documents from the Task_Documents table
            const result = await sql.query`
                SELECT 
                    task_id,
                    DocumentName,
                    DocURL,
                    Created_By,
                    Created_At
                FROM Task_Documents
                WHERE task_id = ${taskId}
                ORDER BY Created_At DESC
            `;
            
            // Return the documents
            res.json(result.recordset || []);
        } catch (dbError) {
            console.log('Error querying Task_Documents table:', dbError);
            console.log('Returning empty array for documents');
            res.json([]);
        }
    } catch (err) {
        console.error('Error fetching documents for task:', err);
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
});

// API endpoint to remove a document from a task
router.delete('/:projectId/tasks/:taskId/documents/:documentName', requireLogin, async (req, res) => {
    try {
        const { taskId, documentName } = req.params;
        
        console.log(`Removing document '${documentName}' from task ID ${taskId}`);
        
        // Delete the document from the database
        const { sql } = await import('../db/sql.js');
        await sql.query`
            DELETE FROM Task_Documents 
            WHERE task_id = ${taskId} AND DocumentName = ${documentName}
        `;
        
        res.json({ success: true, message: 'Document removed from task' });
    } catch (err) {
        console.error('Error removing document from task:', err);
        res.status(500).json({ error: 'Failed to remove document from task' });
    }
});

// API endpoint to remove a user from a task
router.delete('/:projectId/tasks/:taskId/assigned-users/:userId', requireLogin, async (req, res) => {
    try {
        const { taskId, userId } = req.params;
        
        console.log(`Removing user ID ${userId} from task ID ${taskId}`);
        
        // Delete the assignment from the database
        const { sql } = await import('../db/sql.js');
        await sql.query`
            DELETE FROM task_assignedUsers 
            WHERE task_id = ${taskId} AND user_id = ${userId}
        `;
        
        res.json({ success: true, message: 'User removed from task' });
    } catch (err) {
        console.error('Error removing user from task:', err);
        res.status(500).json({ error: 'Failed to remove user from task' });
    }
});

// API endpoint to get assigned users for a task
router.get('/:projectId/tasks/:taskId/assigned-users', requireLogin, async (req, res) => {
    try {
        const taskId = req.params.taskId;
        
        // Fetch assigned users from the database
        const { sql } = await import('../db/sql.js');
        
        // First check if the task_assignedUsers table exists
        try {
            // Query to fetch assigned users from the task_assignedUsers table
            const result = await sql.query`
                SELECT u.id, u.name, u.role
                FROM tbl_users u
                JOIN task_assignedUsers ta ON u.id = ta.user_id
                WHERE ta.task_id = ${taskId}
                ORDER BY u.name ASC
            `;
            
            // Return the assigned users
            res.json(result.recordset || []);
        } catch (dbError) {
            // If there's an error (likely because the table doesn't exist yet)
            console.log('Error querying task_assignedUsers table:', dbError);
            console.log('Returning empty array for assigned users');
            res.json([]);
        }
    } catch (err) {
        console.error('Error fetching assigned users for task:', err);
        res.status(500).json({ error: 'Failed to fetch assigned users' });
    }
});

// API endpoint to get documents for a task
router.get('/:projectId/tasks/:taskId/documents', requireLogin, async (req, res) => {
    try {
        const taskId = req.params.taskId;
        
        // In a real implementation, you would fetch documents from the database
        // For example:
        // const { sql } = await import('../db/sql.js');
        // const result = await sql.query`
        //     SELECT id, document_name as name, document_url as url
        //     FROM task_documents
        //     WHERE task_id = ${taskId}
        //     ORDER BY document_name ASC
        // `;
        // const documents = result.recordset;
        
        // For now, we'll return mock data for demonstration
        const mockDocuments = [
            { id: 'doc_1', name: 'Requirements Document', url: 'https://example.com/docs/requirements.pdf' },
            { id: 'doc_2', name: 'Design Specifications', url: 'https://example.com/docs/design.pdf' }
        ];
        
        res.json(mockDocuments);
    } catch (err) {
        console.error('Error fetching documents for task:', err);
        res.status(500).json({ error: 'Failed to fetch task documents' });
    }
});

export default router;
