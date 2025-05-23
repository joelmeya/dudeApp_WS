import express from 'express';
import sql from 'mssql';
import { requireLogin } from '../middleware/auth.js';

const router = express.Router();

// Route to display the accreditor view page
router.get('/', requireLogin, async (req, res) => {
    try {
        // Log the user role for debugging
        console.log('User role:', req.session.user.role);
        
        // For now, allow all authenticated users to view the accreditor page
        // We'll keep this comment as a reminder that in production, we might want to restrict access
        // to only accreditors, document reviewers, and system admins
        
        // Fetch only COMPLETED projects for accreditor review
        const pool = await sql.connect();
        const result = await pool.request()
            .query(`
                SELECT * 
                FROM Projects 
                WHERE Status = 'COMPLETED' 
                ORDER BY Created_AT DESC
            `);
        
        // Render the accreditor view page with projects
        res.render('accreditorView', {
            user: req.session.user,
            activePage: 'accreditor',
            page: 'accreditor',  // Add page variable for layout template
            title: 'Accreditor View',
            projects: result.recordset || [],
            error: null
        });
    } catch (error) {
        console.error('Error in accreditor view route:', error);
        res.status(500).render('accreditorView', {
            user: req.session.user,
            activePage: 'accreditor',
            page: 'accreditor',  // Add page variable for layout template
            title: 'Accreditor View',
            projects: [],
            error: 'An error occurred while loading projects.'
        });
    }
});

// Route to display the accreditor instrument page
router.get('/instrument/:projectId', requireLogin, async (req, res) => {
    try {
        // Log the user role for debugging
        console.log('User role:', req.session.user.role);
        
        const projectId = req.params.projectId;
        
        // Fetch project details
        const pool = await sql.connect();
        const projectResult = await pool.request()
            .input('projectId', sql.Int, projectId)
            .query(`SELECT * FROM Projects WHERE ProjectID = @projectId`);
        
        const project = projectResult.recordset[0] || { Project_Name: 'Pacucoa_OCT2024' };
        
        // Fetch tasks for this project
        const tasksResult = await pool.request()
            .input('projectId', sql.Int, projectId)
            .query(`
                SELECT 
                    Task_id AS TaskID,
                    Task_Name,
                    Description,
                    Status,
                    Completion_percentage
                FROM Tasks
                WHERE ProjectID = @projectId
                ORDER BY Task_id ASC
            `);
        
        const tasks = tasksResult.recordset;
        console.log(`Fetched ${tasks.length} tasks for project ${projectId}`);
        
        // Render the accreditor instrument page
        res.render('accreditorInstrument', {
            user: req.session.user,
            activePage: 'accreditor',
            page: 'accreditor',  // Add page variable for layout template
            title: 'Accreditor Instrument',
            projectName: project.Project_Name,
            projectId: projectId,
            tasks: tasks, // Pass the fetched tasks to the template
            documents: [],
            evidenceUrl: '/static/evidence-placeholder.html',
            instrumentUrl: '/static/instrument-placeholder.html',
            error: null
        });
    } catch (error) {
        console.error('Error in accreditor instrument route:', error);
        res.status(500).render('accreditorInstrument', {
            user: req.session.user,
            activePage: 'accreditor',
            page: 'accreditor',  // Add page variable for layout template
            title: 'Accreditor Instrument',
            projectName: 'Error Loading Project',
            projectId: req.params.projectId,
            tasks: [],
            documents: [],
            evidenceUrl: '/static/evidence-placeholder.html',
            instrumentUrl: '/static/instrument-placeholder.html',
            error: 'An error occurred while loading project data.'
        });
    }
});

// API endpoint to get documents for a task
router.get('/documents/:taskId', requireLogin, async (req, res) => {
    try {
        const taskId = req.params.taskId;
        
        // Validate inputs
        if (!taskId) {
            return res.status(400).json({ error: 'Task ID is required' });
        }
        
        // Connect to database and fetch documents
        const pool = await sql.connect();
        const result = await pool.request()
            .input('taskId', sql.Int, taskId)
            .query(`
                SELECT 
                    DocumentName,
                    DocURL
                FROM Task_Documents
                WHERE task_id = @taskId
                ORDER BY DocumentName ASC
            `);
        
        const documents = result.recordset;
        console.log(`Fetched ${documents.length} documents for task ${taskId}`);
        
        // Return the documents
        res.json({
            success: true,
            documents: documents
        });
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
});

// API endpoint to get task instrument URL
router.get('/task/:projectId/:taskId', requireLogin, async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const taskId = req.params.taskId;
        
        // Validate inputs
        if (!projectId || !taskId) {
            return res.status(400).json({ error: 'Project ID and Task ID are required' });
        }
        
        // Connect to database and fetch task details
        const pool = await sql.connect();
        const result = await pool.request()
            .input('projectId', sql.Int, projectId)
            .input('taskId', sql.Int, taskId)
            .query(`
                SELECT 
                    Task_id AS TaskID,
                    Task_Name,
                    accreditation_Instrument_URL
                FROM Tasks
                WHERE ProjectID = @projectId AND Task_id = @taskId
            `);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        const task = result.recordset[0];
        console.log('Task details:', task);
        
        // Return the task details
        res.json({
            success: true,
            task: task
        });
    } catch (error) {
        console.error('Error fetching task details:', error);
        res.status(500).json({ error: 'Failed to fetch task details' });
    }
});

export default router;
