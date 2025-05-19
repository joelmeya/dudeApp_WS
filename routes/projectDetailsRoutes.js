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
        
        // Render the project details page with the fetched data
        res.render('projectDetails', { 
            user: req.session.user, 
            page: 'projectDetails',
            projectId: projectId,
            project: project, // Pass project data to the template
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
        const validStatuses = ['NEW', 'FOR REVIEW', 'ONGOING', 'COMPLETED'];
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
            
            // In a real implementation, you would:
            // 1. Delete existing task assignments for this task
            // 2. Insert new task assignments for each user ID
            // For example:
            // const { sql } = await import('../db/sql.js');
            // await sql.query`DELETE FROM task_assignments WHERE task_id = ${taskId}`;
            // for (const userId of assignedUserIdArray) {
            //     await sql.query`INSERT INTO task_assignments (task_id, user_id) VALUES (${taskId}, ${userId})`;
            // }
        }
        
        // Process task documents if present
        if (taskDocumentsData) {
            try {
                const documents = JSON.parse(taskDocumentsData);
                console.log('Task documents:', documents);
                
                // In a real implementation, you would:
                // 1. Delete existing documents for this task
                // 2. Insert new documents
                // For example:
                // const { sql } = await import('../db/sql.js');
                // await sql.query`DELETE FROM task_documents WHERE task_id = ${taskId}`;
                // for (const doc of documents) {
                //     await sql.query`
                //         INSERT INTO task_documents (task_id, document_name, document_url)
                //         VALUES (${taskId}, ${doc.name}, ${doc.url})
                //     `;
                // }
            } catch (parseError) {
                console.error('Error parsing task documents data:', parseError);
            }
        }
        
        // In a real implementation, this would update the database
        // For now, we'll just redirect back with a success parameter for alertify
        
        res.redirect(`/project-details/${projectId}?success=true`);
    } catch (err) {
        console.error('Error updating task:', err);
        res.redirect(`/project-details/${req.params.id}?error=Failed to update task`);
    }
});

// API endpoint to get assigned users for a task
router.get('/:projectId/tasks/:taskId/assigned-users', requireLogin, async (req, res) => {
    try {
        const taskId = req.params.taskId;
        
        // In a real implementation, you would fetch assigned users from the database
        // For example:
        // const { sql } = await import('../db/sql.js');
        // const result = await sql.query`
        //     SELECT u.id, u.name, u.role
        //     FROM tbl_users u
        //     JOIN task_assignments ta ON u.id = ta.user_id
        //     WHERE ta.task_id = ${taskId}
        //     AND u.status = 'active'
        //     ORDER BY u.name ASC
        // `;
        // const assignedUsers = result.recordset;
        
        // For now, we'll return mock data for demonstration
        const mockAssignedUsers = [
            { id: '1', name: 'Joel Eya', role: 'Admin' },
            { id: '2', name: 'Jane Smith', role: 'Document Reviewer' }
        ];
        
        res.json(mockAssignedUsers);
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
